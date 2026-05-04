const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { sendTaskAssignmentEmail } = require('../services/emailService');
const User = require('../models/User');

// ─── GET /api/projects/:id/tasks ─────────────────────────────────────────────
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = { project: req.project._id };

    // Apply optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Members can only see their assigned tasks
    if (!req.isAdmin) {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ status: 1, position: 1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/projects/:id/tasks ────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, tags } = req.body;

    // Calculate position (append to end of status column)
    const lastTask = await Task.findOne({ project: req.project._id, status: status || 'To Do' })
      .sort({ position: -1 })
      .select('position');
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      tags,
      position,
      project: req.project._id,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    // Log activity
    await Activity.create({
      project: req.project._id,
      user: req.user._id,
      action: `Created task "${task.title}"`,
      entityType: 'Task',
      entityId: task._id,
    });

    // Send email notification if task is assigned to someone else
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      const assignee = await User.findById(assignedTo);
      if (assignee) {
        sendTaskAssignmentEmail({
          toEmail: assignee.email,
          toName: assignee.name,
          taskTitle: task.title,
          projectTitle: req.project.title,
          assignedBy: req.user.name,
        });
      }
    }

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify the task belongs to a project the user is a member of
    const project = await Project.findById(task.project);
    const membership = project?.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const isAdmin = membership.role === 'Admin';

    // Members can ONLY update status of their assigned tasks
    if (!isAdmin) {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update their own assigned tasks.',
        });
      }
      // Restrict fields members can update
      const allowedFields = ['status'];
      const attemptedFields = Object.keys(req.body);
      const unauthorizedFields = attemptedFields.filter((f) => !allowedFields.includes(f));
      if (unauthorizedFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Members can only update: ${allowedFields.join(', ')}`,
        });
      }
    }

    const oldStatus = task.status;
    const updated = await Task.findByIdAndUpdate(task._id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    // Log status changes
    if (req.body.status && req.body.status !== oldStatus) {
      await Activity.create({
        project: task.project._id || task.project,
        user: req.user._id,
        action: `Moved "${updated.title}" from ${oldStatus} → ${updated.status}`,
        entityType: 'Task',
        entityId: updated._id,
      });
    }

    res.json({ success: true, task: updated });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/tasks/:id/move ────────────────────────────────────────────────
// Handles drag-and-drop: updates status + position atomically
const moveTask = async (req, res, next) => {
  try {
    const { status, position } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify membership
    const project = await Project.findById(task.project);
    const membership = project?.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.position = position;
    await task.save();

    if (oldStatus !== status) {
      await Activity.create({
        project: task.project,
        user: req.user._id,
        action: `Moved "${task.title}" to ${status}`,
        entityType: 'Task',
        entityId: task._id,
      });
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Verify admin in project
    const project = await Project.findById(task.project);
    const membership = project?.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!membership || membership.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required to delete tasks.' });
    }

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `Deleted task "${task.title}"`,
      entityType: 'Task',
      entityId: task._id,
    });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, moveTask, deleteTask };
