const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route POST /api/upload/resume
router.post('/resume', protect, (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    req.user.resumeUrl = fileUrl;
    req.user.resumeOriginalName = req.file.originalname;
    await req.user.save();

    res.json({ resumeUrl: fileUrl, message: 'Resume uploaded successfully' });
  });
});

module.exports = router;
