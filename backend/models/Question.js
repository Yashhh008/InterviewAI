const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: [
        'technical',
        'dsa',
        'sql',
        'dbms',
        'oop',
        'os',
        'cn',
        'system_design',
        'hr',
        'behavioral',
      ],
      default: 'technical',
    },
    question: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    order: { type: Number, default: 0 },
    userAnswer: { type: String, default: '' },
    aiFeedback: {
      score: { type: Number, min: 0, max: 10, default: 0 },
      accuracy: { type: Number, min: 0, max: 10, default: 0 },
      communication: { type: Number, min: 0, max: 10, default: 0 },
      completeness: { type: Number, min: 0, max: 10, default: 0 },
      relevance: { type: Number, min: 0, max: 10, default: 0 },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      improvedAnswer: { type: String, default: '' },
      keyConceptsMissed: [{ type: String }],
    },
    skipped: { type: Boolean, default: false },
    answeredAt: { type: Date },
  },
  { timestamps: true }
);

questionSchema.index({ interviewId: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
