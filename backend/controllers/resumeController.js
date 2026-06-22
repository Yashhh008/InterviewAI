const fs = require('fs');
const { PDFParse } = require('pdf-parse');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/gemini/resumeAnalyzer');

// @desc    Upload and parse resume
// @route   POST /api/resume/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file.' });
    }

    // Parse PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const parser = new PDFParse({ data: dataBuffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF. Please ensure it is not a scanned image.',
      });
    }

    // Analyze with Gemini AI
    const aiData = await analyzeResume(rawText);

    // Delete existing resume for user
    await Resume.findOneAndDelete({ userId: req.user._id });

    // Save parsed resume
    const resume = await Resume.create({
      userId: req.user._id,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      rawText,
      extractedSkills: aiData.extractedSkills || [],
      projects: aiData.projects || [],
      education: aiData.education || [],
      experience: aiData.experience || [],
      certifications: aiData.certifications || [],
      summary: aiData.summary || '',
      missingInfo: aiData.missingInfo || [],
      improvementSuggestions: aiData.improvementSuggestions || [],
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully!',
      resume,
    });
  } catch (error) {
    // Cleanup uploaded file on error
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    next(error);
  }
};

// @desc    Get current user resume
// @route   GET /api/resume
// @access  Private
const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Please upload your resume.' });
    }
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }
    // Delete file
    if (resume.filePath) {
      try { fs.unlinkSync(resume.filePath); } catch {}
    }
    res.json({ success: true, message: 'Resume deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadResume, getResume, deleteResume };
