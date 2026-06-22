const express = require('express');
const router = express.Router();
const { matchATS, getATSReports, getATSReport } = require('../controllers/atsController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/match', protect, aiLimiter, matchATS);
router.get('/reports', protect, getATSReports);
router.get('/reports/:id', protect, getATSReport);

module.exports = router;
