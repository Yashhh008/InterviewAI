const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalFilename: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedSkills: [{ type: String }],
    projects: [
      {
        name: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
      },
    ],
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String },
        field: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String },
        role: { type: String },
        duration: { type: String },
        description: { type: String },
      },
    ],
    certifications: [{ type: String }],
    rawText: { type: String },
    summary: { type: String },
    missingInfo: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    parsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
