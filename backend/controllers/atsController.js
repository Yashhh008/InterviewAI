const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const ATSReport = require('../models/ATSReport');
const { calculateATS } = require('../services/gemini/atsCalculator');
const { analyzeSkillGap } = require('../services/gemini/skillGapAnalyzer');

// @desc    Generate ATS match report
// @route   POST /api/ats/match
// @access  Private
const matchATS = async (req, res, next) => {
  try {
    const { resumeId, jdId } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const jd = await JobDescription.findOne({ _id: jdId, userId: req.user._id });
    if (!jd) {
      return res.status(404).json({ success: false, message: 'Job description not found.' });
    }

    // Run ATS calculation
    const atsData = await calculateATS(resume, jd);

    // Run skill gap analysis
    const skillGapData = await analyzeSkillGap({
      resumeSkills: resume.extractedSkills,
      requiredSkills: jd.requiredSkills,
      missingSkills: atsData.missingSkills,
      role: jd.role,
    });

    const report = await ATSReport.create({
      userId: req.user._id,
      resumeId,
      jdId,
      atsScore: atsData.atsScore,
      matchingSkills: atsData.matchingSkills,
      missingSkills: atsData.missingSkills,
      recommendations: atsData.recommendations,
      keywordAnalysis: atsData.keywordAnalysis,
      skillGap: skillGapData,
    });

    res.status(201).json({
      success: true,
      message: 'ATS analysis complete!',
      report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all ATS reports for user
// @route   GET /api/ats/reports
// @access  Private
const getATSReports = async (req, res, next) => {
  try {
    const reports = await ATSReport.find({ userId: req.user._id })
      .populate('resumeId', 'originalFilename')
      .populate('jdId', 'role company')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ATS report
// @route   GET /api/ats/reports/:id
// @access  Private
const getATSReport = async (req, res, next) => {
  try {
    const report = await ATSReport.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('resumeId')
      .populate('jdId');

    if (!report) {
      return res.status(404).json({ success: false, message: 'ATS report not found.' });
    }

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { matchATS, getATSReports, getATSReport };
