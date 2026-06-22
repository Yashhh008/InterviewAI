const express = require('express');
const router = express.Router();
const { analyzeJobDescription, getJDs, getJD, deleteJD } = require('../controllers/jdController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/analyze', protect, aiLimiter, upload.single('jd'), analyzeJobDescription);
router.get('/', protect, getJDs);
router.get('/:id', protect, getJD);
router.delete('/:id', protect, deleteJD);

module.exports = router;
