const express = require('express');
const router = express.Router();
const { updateTask, deleteTask, moveTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateTaskSchema, moveTaskSchema } = require('../utils/schemas');

// Update task (members: status only; admins: all fields) — RBAC enforced inside controller
router.put('/:id', authenticate, validate(updateTaskSchema), updateTask);

// Kanban drag-and-drop: update status + position atomically
router.patch('/:id/move', authenticate, validate(moveTaskSchema), moveTask);

// Delete task (Admin only) — checked inside controller
router.delete('/:id', authenticate, deleteTask);

module.exports = router;
