const express = require('express');
const Note = require('../models/Note');
const { protect, allowRoles } = require('../middleware/auth');
const uploadNote = require('../middleware/uploadNote');

const router = express.Router();

// @route GET /api/notes  (public) - search & filter
router.get('/', async (req, res) => {
  try {
    const { q, subject } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }
    if (subject) filter.subject = { $regex: subject, $options: 'i' };

    const notes = await Note.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'name');
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/notes/subjects  (public) - distinct subject list, for filter dropdown
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Note.distinct('subject');
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/notes  (admin only) - upload a PDF note
router.post('/', protect, allowRoles('admin'), (req, res) => {
  uploadNote.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });
    try {
      const { title, subject, description, tags } = req.body;
      if (!title || !subject) return res.status(400).json({ message: 'Title and subject are required' });

      const note = await Note.create({
        title,
        subject,
        description: description || '',
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        fileUrl: `/uploads/notes/${req.file.filename}`,
        fileOriginalName: req.file.originalname,
        uploadedBy: req.user._id
      });
      res.status(201).json({ note });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// @route POST /api/notes/:id/download  (increments download counter — called when a student opens the file)
router.post('/:id/download', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } }, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ downloadCount: note.downloadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/notes/:id  (admin only)
router.delete('/:id', protect, allowRoles('admin'), async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
