const Project = require('../models/Project');

/**
 * Middleware: Ensures req.user is a member of the project specified by :id or :projectId.
 * Attaches req.project (full project doc) and req.isAdmin (boolean) for downstream use.
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check if requesting user is a member
    const membership = project.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.',
      });
    }

    req.project = project;
    req.isAdmin = membership.role === 'Admin';
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware: Blocks non-admin members from proceeding.
 * Must be used AFTER requireProjectMember (relies on req.isAdmin).
 */
const requireAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

module.exports = { requireProjectMember, requireAdmin };
