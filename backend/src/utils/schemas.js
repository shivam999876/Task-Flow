const Joi = require('joi');

// ─── Auth Schemas ───────────────────────────────────────────────────────────

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── Project Schemas ────────────────────────────────────────────────────────

const createProjectSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateProjectSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
}).min(1);

const addMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Member email is required',
    'string.email': 'Please enter a valid email',
  }),
  role: Joi.string().valid('Admin', 'Member').default('Member'),
});

// ─── Task Schemas ───────────────────────────────────────────────────────────

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(150).required(),
  description: Joi.string().max(1000).allow('').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').default('Medium'),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').default('To Do'),
  assignedTo: Joi.string().hex().length(24).allow(null).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(150).optional(),
  description: Joi.string().max(1000).allow('').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  priority: Joi.string().valid('Low', 'Medium', 'High').optional(),
  status: Joi.string().valid('To Do', 'In Progress', 'Done').optional(),
  assignedTo: Joi.string().hex().length(24).allow(null).optional(),
  position: Joi.number().integer().min(0).optional(),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional(),
}).min(1);

const moveTaskSchema = Joi.object({
  status: Joi.string().valid('To Do', 'In Progress', 'Done').required(),
  position: Joi.number().integer().min(0).required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
};
