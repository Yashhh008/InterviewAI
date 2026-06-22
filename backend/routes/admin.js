const express = require('express');
const router = express.Router();
const { getUsers, getPlatformStats, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.get('/stats', getPlatformStats);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
