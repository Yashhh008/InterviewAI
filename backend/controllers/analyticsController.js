const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Resume = require('../models/Resume');

// @desc    Get full analytics for user
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [interviews, resume, totalQuestions] = await Promise.all([
      Interview.find({ userId, status: 'completed' }).sort({ createdAt: 1 }),
      Resume.findOne({ userId }),
      Question.countDocuments({ userId }),
    ]);

    // Dashboard cards
    const totalInterviews = interviews.length;
    const avgScore = totalInterviews > 0
      ? +(interviews.reduce((sum, i) => sum + i.overallScore, 0) / totalInterviews).toFixed(1)
      : 0;

    const latestInterview = interviews[interviews.length - 1];
    const readinessScore = latestInterview
      ? Math.min(
          Math.round((latestInterview.overallScore / 10) * 100),
          100
        )
      : 0;

    // Weekly performance (last 8 weeks)
    const weeklyData = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - w * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekInterviews = interviews.filter(i => {
        const d = new Date(i.createdAt);
        return d >= weekStart && d < weekEnd;
      });

      weeklyData.push({
        week: `W${8 - w}`,
        date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        interviews: weekInterviews.length,
        avgScore: weekInterviews.length > 0
          ? +(weekInterviews.reduce((sum, i) => sum + i.overallScore, 0) / weekInterviews.length).toFixed(1)
          : 0,
      });
    }

    // Topic-wise performance from questions
    const allQuestions = await Question.find({ userId, skipped: false });
    const topicMap = {};
    allQuestions.forEach(q => {
      if (!topicMap[q.category]) topicMap[q.category] = { total: 0, scoreSum: 0 };
      topicMap[q.category].total++;
      topicMap[q.category].scoreSum += q.aiFeedback?.score || 0;
    });

    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic: topic.toUpperCase().replace('_', ' '),
      avgScore: +(data.scoreSum / data.total).toFixed(1),
      count: data.total,
    }));

    // Score over time
    const scoreTimeline = interviews.map(i => ({
      date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: i.overallScore,
      technical: i.technicalScore,
      communication: i.communicationScore,
      hr: i.hrScore,
      company: i.company,
      role: i.role,
    }));

    // Weak areas aggregation
    const weakAreaMap = {};
    interviews.forEach(i => {
      i.weakAreas?.forEach(area => {
        weakAreaMap[area] = (weakAreaMap[area] || 0) + 1;
      });
    });
    const topWeakAreas = Object.entries(weakAreaMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    res.json({
      success: true,
      analytics: {
        summary: {
          totalInterviews,
          avgScore,
          readinessScore,
          totalQuestions,
          resumeUploaded: !!resume,
          lastInterviewDate: latestInterview?.createdAt,
        },
        weeklyData,
        topicPerformance,
        scoreTimeline,
        topWeakAreas,
        recentInterviews: interviews.slice(-5).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
