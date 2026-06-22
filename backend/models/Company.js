const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    overview: { type: String, default: '' },
    businessModel: { type: String, default: '' },
    products: [{ type: String }],
    techStack: [{ type: String }],
    interviewPattern: { type: String, default: '' },
    frequentTopics: [{ type: String }],
    importantConcepts: [{ type: String }],
    hrQuestions: [{ type: String }],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Very Hard'],
      default: 'Medium',
    },
    cachedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Cache middleware / model logic here if needed

module.exports = mongoose.model('Company', companySchema);
