const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'recruiter', 'admin'], default: 'user' },

    // Job seeker specific
    phone: { type: String, default: '' },
    college: { type: String, default: '' },
    branch: { type: String, default: '' },
    graduationYear: { type: String, default: '' },
    skills: [{ type: String }],
    resumeUrl: { type: String, default: '' },
    resumeOriginalName: { type: String, default: '' },
    bio: { type: String, default: '' },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

    // Recruiter specific
    companyName: { type: String, default: '' },
    companyWebsite: { type: String, default: '' },
    designation: { type: String, default: '' },

    isBlocked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
