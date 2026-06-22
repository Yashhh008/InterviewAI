const express = require('express');
const router = express.Router();
const {
  startInterview, submitAnswer, skipQuestion, completeInterview, getHistory, getInterview
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/start', protect, aiLimiter, startInterview);
router.post('/:id/submit-answer', protect, aiLimiter, submitAnswer);
router.post('/:id/skip', protect, skipQuestion);
router.post('/:id/complete', protect, aiLimiter, completeInterview);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
