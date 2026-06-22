const express = require('express');
const router = express.Router();
const { uploadResume, getResume, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/upload', protect, aiLimiter, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);
router.delete('/', protect, deleteResume);

module.exports = router;
