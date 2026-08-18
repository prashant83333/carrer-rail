const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time'
    },
    workMode: { type: String, enum: ['Onsite', 'Remote', 'Hybrid'], default: 'Onsite' },
    category: { type: String, default: 'General', trim: true },
    minSalary: { type: Number, default: 0 },
    maxSalary: { type: Number, default: 0 },
    experience: { type: String, default: 'Fresher' },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    skillsRequired: [{ type: String }],
    openings: { type: Number, default: 1 },
    applicationDeadline: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true } // admin can moderate
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', skillsRequired: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
