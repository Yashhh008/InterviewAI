const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawText: { type: String, required: true },
    role: { type: String, default: '' },
    company: { type: String, default: '' },
    experienceLevel: {
      type: String,
      enum: ['Intern', 'Entry', 'Mid', 'Senior', 'Lead', 'Unknown'],
      default: 'Unknown',
    },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    responsibilities: [{ type: String }],
    interviewTopics: [{ type: String }],
    originalFilename: { type: String, default: '' },
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
