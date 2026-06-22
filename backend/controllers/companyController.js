const Company = require('../models/Company');
const { researchCompany } = require('../services/gemini/companyResearcher');

const CACHE_DURATION_DAYS = 7;

// @desc    Research a company
// @route   POST /api/company/research
// @access  Private
const researchCompanyHandler = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Company name is required.' });
    }

    const normalizedName = name.trim();

    // Check cache (case-insensitive)
    const cached = await Company.findOne({
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
    });

    if (cached) {
      const cacheAge = (Date.now() - new Date(cached.cachedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (cacheAge < CACHE_DURATION_DAYS) {
        return res.json({
          success: true,
          message: 'Company profile loaded from cache.',
          company: cached,
          fromCache: true,
        });
      }
      // Cache expired, regenerate
      await Company.findByIdAndDelete(cached._id);
    }

    // Fetch from Gemini AI
    const companyData = await researchCompany(normalizedName);

    const company = await Company.create({
      ...companyData,
      name: normalizedName,
      cachedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Company profile generated successfully!',
      company,
      fromCache: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company by name
// @route   GET /api/company/:name
// @access  Private
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      name: { $regex: new RegExp(`^${req.params.name}$`, 'i') },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found. Please research this company first.',
      });
    }

    res.json({ success: true, company });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cached companies
// @route   GET /api/company
// @access  Private
const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find({}, 'name overview difficulty cachedAt').sort({ name: 1 });
    res.json({ success: true, count: companies.length, companies });
  } catch (error) {
    next(error);
  }
};

module.exports = { researchCompanyHandler, getCompany, getAllCompanies };
