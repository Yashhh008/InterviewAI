const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { generateQuestions } = require('../services/gemini/questionGenerator');
const { evaluateAnswer } = require('../services/gemini/answerEvaluator');
const { generateReport } = require('../services/gemini/reportGenerator');

// @desc    Start a new interview
// @route   POST /api/interview/start
// @access  Private
const startInterview = async (req, res, next) => {
  try {
    const { company, role, mode, resumeId, jdId, questionCount = 10 } = req.body;

    let resumeData = null;
    let jdData = null;

    if (resumeId) {
      resumeData = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    } else {
      resumeData = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    if (jdId) {
      jdData = await JobDescription.findOne({ _id: jdId, userId: req.user._id });
    }

    // Generate questions
    const generatedQuestions = await generateQuestions({
      resumeData,
      jdData,
      company: company || jdData?.company,
      role: role || jdData?.role,
      mode: mode || 'practice',
      count: Math.min(Math.max(parseInt(questionCount), 5), 20),
    });

    // Create interview session
    const interview = await Interview.create({
      userId: req.user._id,
      resumeId: resumeData?._id,
      jdId: jdData?._id,
      company: company || jdData?.company || '',
      role: role || jdData?.role || '',
      mode: mode || 'practice',
      totalQuestions: generatedQuestions.length,
      status: 'in_progress',
    });

    // Save questions
    const questions = await Question.insertMany(
      generatedQuestions.map((q, index) => ({
        interviewId: interview._id,
        userId: req.user._id,
        category: q.category,
        question: q.question,
        difficulty: q.difficulty,
        order: index,
      }))
    );

    res.status(201).json({
      success: true,
      message: 'Interview started!',
      interview,
      questions: questions.map(q => ({
        _id: q._id,
        category: q.category,
        question: q.question,
        difficulty: q.difficulty,
        order: q.order,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answer for a question
// @route   POST /api/interview/:id/submit-answer
// @access  Private
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;
    const { id: interviewId } = req.params;

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview || interview.status !== 'in_progress') {
      return res.status(404).json({ success: false, message: 'Active interview not found.' });
    }

    const question = await Question.findOne({ _id: questionId, interviewId, userId: req.user._id });
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Evaluate answer with AI
    const feedback = await evaluateAnswer({
      question: question.question,
      userAnswer: answer,
      category: question.category,
      difficulty: question.difficulty,
    });

    // Update question
    question.userAnswer = answer;
    question.aiFeedback = feedback;
    question.answeredAt = new Date();
    question.skipped = false;
    await question.save();

    // Update interview progress
    await Interview.findByIdAndUpdate(interviewId, {
      $inc: { answeredQuestions: 1 },
    });

    res.json({
      success: true,
      message: 'Answer evaluated!',
      feedback,
      question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Skip a question
// @route   POST /api/interview/:id/skip
// @access  Private
const skipQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const { id: interviewId } = req.params;

    const question = await Question.findOneAndUpdate(
      { _id: questionId, interviewId, userId: req.user._id },
      { skipped: true },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    await Interview.findByIdAndUpdate(interviewId, {
      $inc: { skippedQuestions: 1 },
    });

    res.json({ success: true, message: 'Question skipped.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview and generate report
// @route   POST /api/interview/:id/complete
// @access  Private
const completeInterview = async (req, res, next) => {
  try {
    const { id: interviewId } = req.params;

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const questions = await Question.find({ interviewId });

    // Generate AI report
    const report = await generateReport({ interview, questions });

    // Calculate duration in minutes
    const duration = Math.round((Date.now() - new Date(interview.startedAt).getTime()) / 60000);

    // Update interview with report
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      {
        status: 'completed',
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        hrScore: report.hrScore,
        strengths: report.strengths,
        weakAreas: report.weakAreas,
        improvementPlan: report.improvementPlan,
        studyPlan: report.studyPlan,
        duration,
        completedAt: new Date(),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Interview completed! Report generated.',
      interview: updatedInterview,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = { userId: req.user._id };
    if (req.query.company) filters.company = { $regex: req.query.company, $options: 'i' };
    if (req.query.role) filters.role = { $regex: req.query.role, $options: 'i' };
    if (req.query.mode) filters.mode = req.query.mode;
    if (req.query.status) filters.status = req.query.status;

    const [interviews, total] = await Promise.all([
      Interview.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Interview.countDocuments(filters),
    ]);

    res.json({
      success: true,
      interviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single interview with questions
// @route   GET /api/interview/:id
// @access  Private
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    const questions = await Question.find({ interviewId: req.params.id }).sort({ order: 1 });

    res.json({ success: true, interview, questions });
  } catch (error) {
    next(error);
  }
};

module.exports = { startInterview, submitAnswer, skipQuestion, completeInterview, getHistory, getInterview };
