const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: mongoose.Schema.Types.Mixed, required: true }, // array of arguments passed to the function
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    isHidden: { type: Boolean, default: false } // hidden cases aren't shown in the problem statement
  },
  { _id: false }
);

const codingProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    tags: [{ type: String }],
    description: { type: String, required: true },
    functionName: { type: String, required: true }, // the function the student must define
    starterCode: { type: String, default: '' },
    examples: [
      {
        input: { type: String },
        output: { type: String },
        explanation: { type: String }
      }
    ],
    testCases: [testCaseSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

codingProblemSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
