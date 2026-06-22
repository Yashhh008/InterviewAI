const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const JobDescription = require('../models/JobDescription');
const { analyzeJD } = require('../services/gemini/jdAnalyzer');

// @desc    Analyze job description (text or PDF)
// @route   POST /api/jd/analyze
// @access  Private
const analyzeJobDescription = async (req, res, next) => {
  try {
    let rawText = '';
    let originalFilename = '';

    if (req.file) {
      // PDF upload
      const dataBuffer = fs.readFileSync(req.file.path);
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      await parser.destroy();
      rawText = pdfData.text;
      originalFilename = req.file.originalname;
    } else if (req.body.text) {
      rawText = req.body.text;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide job description text or upload a PDF.',
      });
    }

    if (!rawText || rawText.trim().length < 30) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short to analyze.',
      });
    }

    const aiData = await analyzeJD(rawText);

    const jd = await JobDescription.create({
      userId: req.user._id,
      rawText,
      originalFilename,
      role: aiData.role || '',
      company: aiData.company || req.body.company || '',
      experienceLevel: aiData.experienceLevel || 'Unknown',
      requiredSkills: aiData.requiredSkills || [],
      preferredSkills: aiData.preferredSkills || [],
      responsibilities: aiData.responsibilities || [],
      interviewTopics: aiData.interviewTopics || [],
    });

    // Cleanup file
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }

    res.status(201).json({
      success: true,
      message: 'Job description analyzed successfully!',
      jd,
    });
  } catch (error) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    next(error);
  }
};

// @desc    Get all user JDs
// @route   GET /api/jd
// @access  Private
const getJDs = async (req, res, next) => {
  try {
    const jds = await JobDescription.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jds.length, jds });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single JD
// @route   GET /api/jd/:id
// @access  Private
const getJD = async (req, res, next) => {
  try {
    const jd = await JobDescription.findOne({ _id: req.params.id, userId: req.user._id });
    if (!jd) {
      return res.status(404).json({ success: false, message: 'Job description not found.' });
    }
    res.json({ success: true, jd });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete JD
// @route   DELETE /api/jd/:id
// @access  Private
const deleteJD = async (req, res, next) => {
  try {
    const jd = await JobDescription.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!jd) {
      return res.status(404).json({ success: false, message: 'Job description not found.' });
    }
    res.json({ success: true, message: 'Job description deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeJobDescription, getJDs, getJD, deleteJD };
