const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// @route POST /api/applications/:jobId  (job seeker only)
router.post('/:jobId', protect, allowRoles('user'), async (req, res) => {
  try {
    if (!req.user.resumeUrl) {
      return res.status(400).json({ message: 'Please upload your resume before applying' });
    }
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (existing) return res.status(409).json({ message: 'You have already applied to this job' });

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      resumeUrl: req.user.resumeUrl,
      coverNote: req.body.coverNote || ''
    });
    res.status(201).json({ application, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/applications/mine  (job seeker) - my applications
router.get('/mine', protect, allowRoles('user'), async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/applications/recruiter/stats (recruiter - status breakdown across all own jobs)
router.get('/recruiter/stats', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).select('_id');
    const jobIds = jobs.map((j) => j._id);
    const applications = await Application.find({ job: { $in: jobIds } });
    const breakdown = { Applied: 0, Shortlisted: 0, Interview: 0, Selected: 0, Rejected: 0 };
    applications.forEach((a) => { breakdown[a.status] = (breakdown[a.status] || 0) + 1; });
    res.json({ total: applications.length, breakdown });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/applications/job/:jobId (recruiter - view applicants for a job)
router.get('/job/:jobId', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your job posting' });
    }
    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'name email phone college branch graduationYear skills resumeUrl resumeOriginalName')
      .sort({ createdAt: -1 });
    res.json({ applications, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/applications/:id/status  (recruiter - update status)
router.put('/:id/status', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Selected'];
    if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (String(application.job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your job posting' });
    }
    application.status = status;
    await application.save();
    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
