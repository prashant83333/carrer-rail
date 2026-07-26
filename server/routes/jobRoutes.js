const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// @route GET /api/jobs  (public) - search & filter
// query params: q, location, jobType, workMode, category, minSalary, experience, page, limit
router.get('/', async (req, res) => {
  try {
    const {
      q, location, jobType, workMode, category, minSalary, experience,
      page = 1, limit = 9
    } = req.query;

    const filter = { isActive: true, isApproved: true };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { skillsRequired: { $regex: q, $options: 'i' } }
      ];
    }
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (experience) filter.experience = { $regex: experience, $options: 'i' };
    if (minSalary) filter.maxSalary = { $gte: Number(minSalary) };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(filter)
    ]);

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/jobs  (recruiter only)
router.post('/', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user._id, company: req.body.company || req.user.companyName });
    res.status(201).json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/jobs/:id/save  (job seeker only) - toggle save/unsave a job
router.post('/:id/save', protect, allowRoles('user'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const idx = req.user.savedJobs.findIndex((j) => String(j) === String(job._id));
    let saved;
    if (idx > -1) {
      req.user.savedJobs.splice(idx, 1);
      saved = false;
    } else {
      req.user.savedJobs.push(job._id);
      saved = true;
    }
    await req.user.save();
    res.json({ saved, savedJobs: req.user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/jobs/saved/mine  (job seeker only) - list saved jobs
router.get('/saved/mine', protect, allowRoles('user'), async (req, res) => {
  try {
    const user = await req.user.populate('savedJobs');
    res.json({ jobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/jobs/recruiter/mine  (recruiter only) - jobs posted by logged-in recruiter
router.get('/recruiter/mine', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount: count };
      })
    );
    res.json({ jobs: jobsWithCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/jobs/:id  (recruiter - own jobs only)
router.put('/:id', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your job posting' });
    }
    Object.assign(job, req.body);
    await job.save();
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/jobs/:id (recruiter - own jobs only)
router.delete('/:id', protect, allowRoles('recruiter'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (String(job.postedBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your job posting' });
    }
    await job.deleteOne();
    await Application.deleteMany({ job: job._id });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
