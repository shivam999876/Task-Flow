const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Human-readable action string, e.g. "created task 'Fix login bug'"
    action: {
      type: String,
      required: true,
      maxlength: 300,
    },
    // What kind of entity was affected
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Member'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast per-project activity fetching (newest first)
activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
