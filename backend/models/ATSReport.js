const mongoose = require('mongoose');

const atsReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true,
    },
    jdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
      required: true,
    },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    recommendations: [{ type: String }],
    keywordAnalysis: {
      totalKeywords: { type: Number, default: 0 },
      matchedKeywords: { type: Number, default: 0 },
      matchPercentage: { type: Number, default: 0 },
    },
    skillGap: {
      missingSkills: [{ type: String }],
      roadmap: [
        {
          week: { type: Number },
          topic: { type: String },
          description: { type: String },
        },
      ],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ATSReport', atsReportSchema);
