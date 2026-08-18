const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    tags: [{ type: String }],
    fileUrl: { type: String, required: true },
    fileOriginalName: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloadCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

noteSchema.index({ title: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
