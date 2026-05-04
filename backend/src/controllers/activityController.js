const Activity = require('../models/Activity');
const Project = require('../models/Project');

// ─── GET /api/projects/:id/activity ──────────────────────────────────────────
const getActivity = async (req, res, next) => {
  try {
    const projectId = req.params.id;

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      Activity.find({ project: projectId })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Activity.countDocuments({ project: projectId }),
    ]);

    res.json({
      success: true,
      activities,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivity };
