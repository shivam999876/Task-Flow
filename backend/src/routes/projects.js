const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { getTasks, createTask } = require('../controllers/taskController');
const { getActivity } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireAdmin } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  createTaskSchema,
} = require('../utils/schemas');

// ── Project CRUD ─────────────────────────────────────────────────────────────
router.get('/', authenticate, getProjects);
router.post('/', authenticate, validate(createProjectSchema), createProject);

router.get('/:id', authenticate, requireProjectMember, getProject);
router.put('/:id', authenticate, requireProjectMember, requireAdmin, validate(updateProjectSchema), updateProject);
router.delete('/:id', authenticate, requireProjectMember, requireAdmin, deleteProject);

// ── Member management (Admin only) ───────────────────────────────────────────
router.post('/:id/members', authenticate, requireProjectMember, requireAdmin, validate(addMemberSchema), addMember);
router.delete('/:id/members/:userId', authenticate, requireProjectMember, requireAdmin, removeMember);

// ── Tasks within a project ───────────────────────────────────────────────────
router.get('/:id/tasks', authenticate, requireProjectMember, getTasks);
router.post('/:id/tasks', authenticate, requireProjectMember, requireAdmin, validate(createTaskSchema), createTask);

// ── Activity log ─────────────────────────────────────────────────────────────
router.get('/:id/activity', authenticate, requireProjectMember, getActivity);

module.exports = router;
