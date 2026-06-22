const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
    },
    jdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobDescription',
    },
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    mode: {
      type: String,
      enum: ['practice', 'timed', 'company', 'role'],
      default: 'practice',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    skippedQuestions: { type: Number, default: 0 },
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    technicalScore: { type: Number, min: 0, max: 10, default: 0 },
    communicationScore: { type: Number, min: 0, max: 10, default: 0 },
    hrScore: { type: Number, min: 0, max: 10, default: 0 },
    strengths: [{ type: String }],
    weakAreas: [{ type: String }],
    improvementPlan: { type: String, default: '' },
    studyPlan: [
      {
        day: { type: String },
        topic: { type: String },
        resources: [{ type: String }],
      },
    ],
    duration: { type: Number, default: 0 }, // in minutes
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for user queries
interviewSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Interview', interviewSchema);
