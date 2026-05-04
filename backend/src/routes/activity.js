const express = require('express');
const router = express.Router();
const { getActivity } = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/rbac');

// Also accessible via /api/projects/:id/activity — this is a standalone route
router.get('/:id', authenticate, requireProjectMember, getActivity);

module.exports = router;
