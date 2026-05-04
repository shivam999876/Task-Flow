const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// ─── GET /api/projects ───────────────────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    // Find all projects where user is a member
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Attach task counts efficiently
    const projectIds = projects.map((p) => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(taskCounts.map((t) => [t._id.toString(), t.count]));

    const enriched = projects.map((p) => ({
      ...p.toObject(),
      taskCount: countMap[p._id.toString()] || 0,
    }));

    res.json({ success: true, count: enriched.length, projects: enriched });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects ──────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { title, description, color } = req.body;

    const project = await Project.create({
      title,
      description,
      color,
      createdBy: req.user._id,
      // Creator is automatically added as Admin
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    await project.populate('createdBy', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/projects/:id ───────────────────────────────────────────────────
const getProject = async (req, res, next) => {
  try {
    // req.project is set by requireProjectMember middleware
    await req.project.populate('createdBy', 'name email avatar');
    await req.project.populate('members.user', 'name email avatar');

    res.json({ success: true, project: req.project, isAdmin: req.isAdmin });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/projects/:id ───────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.project._id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    await Activity.create({
      project: req.project._id,
      user: req.user._id,
      action: `Updated project "${updated.title}"`,
      entityType: 'Project',
      entityId: updated._id,
    });

    res.json({ success: true, project: updated });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:id ────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    // Delete all related tasks and activity logs first
    await Task.deleteMany({ project: req.project._id });
    await Activity.deleteMany({ project: req.project._id });
    await Project.findByIdAndDelete(req.project._id);

    res.json({ success: true, message: 'Project and all related data deleted.' });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:id/members ─────────────────────────────────────────
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: 'No user found with that email.' });
    }

    // Check if already a member
    const alreadyMember = req.project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(409).json({ success: false, message: 'User is already a member.' });
    }

    req.project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await req.project.save();
    await req.project.populate('members.user', 'name email avatar');

    await Activity.create({
      project: req.project._id,
      user: req.user._id,
      action: `Added ${userToAdd.name} as ${role || 'Member'}`,
      entityType: 'Member',
      entityId: userToAdd._id,
    });

    res.json({ success: true, project: req.project });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/projects/:id/members/:userId ────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent removing the project creator
    if (userId === req.project.createdBy.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project creator.' });
    }

    const memberIndex = req.project.members.findIndex(
      (m) => m.user.toString() === userId
    );
    if (memberIndex === -1) {
      return res.status(404).json({ success: false, message: 'Member not found in project.' });
    }

    req.project.members.splice(memberIndex, 1);
    await req.project.save();

    // Unassign any tasks assigned to this user in this project
    await Task.updateMany(
      { project: req.project._id, assignedTo: userId },
      { assignedTo: null }
    );

    await Activity.create({
      project: req.project._id,
      user: req.user._id,
      action: `Removed a member from the project`,
      entityType: 'Member',
      entityId: userId,
    });

    res.json({ success: true, message: 'Member removed successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
