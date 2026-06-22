const User = require('../models/User');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Question = require('../models/Question');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalInterviews, totalResumes, completedInterviews, avgScoreResult] = await Promise.all([
      User.countDocuments(),
      Interview.countDocuments(),
      Resume.countDocuments(),
      Interview.countDocuments({ status: 'completed' }),
      Interview.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, avg: { $avg: '$overallScore' } } },
      ]),
    ]);

    // New users in last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    // Interviews per day last 7 days
    const dailyInterviews = await Interview.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        newUsersThisWeek: newUsers,
        totalInterviews,
        completedInterviews,
        totalResumes,
        avgPlatformScore: avgScoreResult[0]?.avg?.toFixed(1) || 0,
        dailyInterviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getPlatformStats, toggleUserStatus };
