const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();
router.use(protect, allowRoles('admin'));

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalRecruiters, totalJobs, totalApplications, activeJobs] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ isActive: true, isApproved: true })
    ]);
    res.json({ totalUsers, totalRecruiters, totalJobs, totalApplications, activeJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/admin/users/:id/block
router.put('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/admin/jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name companyName email').sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/admin/jobs/:id/toggle  (approve/suspend a job posting)
router.put('/jobs/:id/toggle', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.isApproved = !job.isApproved;
    await job.save();
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/admin/jobs/:id
router.delete('/jobs/:id', async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
