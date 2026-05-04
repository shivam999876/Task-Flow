const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * GET /api/dashboard
 * Returns aggregated analytics for the authenticated user's projects.
 * Uses MongoDB aggregation pipelines for efficient queries.
 */
const getDashboard = async (req, res, next) => {
  try {
    // Get all projects user is a member of
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id title');
    const projectIds = userProjects.map((p) => p._id);

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalTasks: 0,
          tasksByStatus: [],
          tasksByPriority: [],
          tasksByProject: [],
          tasksPerUser: [],
          overdueTasks: 0,
          recentTasks: [],
        },
      });
    }

    const now = new Date();

    // ── Run all aggregations in parallel ────────────────────────────────────
    const [
      totalResult,
      tasksByStatus,
      tasksByPriority,
      tasksByProject,
      tasksPerUser,
      overdueCount,
      recentTasks,
    ] = await Promise.all([
      // Total task count
      Task.countDocuments({ project: { $in: projectIds } }),

      // Tasks grouped by status
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Tasks grouped by priority
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Tasks grouped by project
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$project', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        { $project: { projectTitle: '$project.title', count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // Tasks per assigned user (top 10)
      Task.aggregate([
        { $match: { project: { $in: projectIds }, assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        { $project: { userName: '$user.name', userEmail: '$user.email', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Overdue task count (past dueDate and not Done)
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'Done' },
      }),

      // 5 most recently created tasks
      Task.find({ project: { $in: projectIds } })
        .populate('assignedTo', 'name avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status priority dueDate project assignedTo createdAt'),
    ]);

    res.json({
      success: true,
      stats: {
        totalTasks: totalResult,
        totalProjects: projectIds.length,
        tasksByStatus,
        tasksByPriority,
        tasksByProject,
        tasksPerUser,
        overdueTasks: overdueCount,
        recentTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
