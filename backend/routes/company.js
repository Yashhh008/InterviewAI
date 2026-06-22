const express = require('express');
const router = express.Router();
const { researchCompanyHandler, getCompany, getAllCompanies } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/research', protect, aiLimiter, researchCompanyHandler);
router.get('/', protect, getAllCompanies);
router.get('/:name', protect, getCompany);

module.exports = router;
