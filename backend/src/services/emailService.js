const nodemailer = require('nodemailer');

/**
 * Email service using Nodemailer.
 * Set EMAIL_USER and EMAIL_PASS in .env to enable.
 * Currently used for task assignment notifications.
 */

const isConfigured =
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_HOST;

let transporter;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends an email notification when a task is assigned to a user.
 * Silently skips if email is not configured.
 *
 * @param {object} options
 * @param {string} options.toEmail - Recipient email
 * @param {string} options.toName - Recipient name
 * @param {string} options.taskTitle - Task that was assigned
 * @param {string} options.projectTitle - Project the task belongs to
 * @param {string} options.assignedBy - Name of who assigned the task
 */
const sendTaskAssignmentEmail = async ({ toEmail, toName, taskTitle, projectTitle, assignedBy }) => {
  if (!isConfigured) {
    console.log('[Email] Not configured — skipping task assignment notification');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"TaskFlow" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `[TaskFlow] You've been assigned a task: ${taskTitle}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0F172A; color: #E2E8F0; padding: 32px; border-radius: 12px;">
          <h2 style="color: #6366F1; margin-bottom: 16px;">📋 New Task Assigned</h2>
          <p>Hi <strong>${toName}</strong>,</p>
          <p><strong>${assignedBy}</strong> has assigned you a task in the project <strong>${projectTitle}</strong>.</p>
          <div style="background: #1E293B; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #6366F1;">
            <strong>${taskTitle}</strong>
          </div>
          <p>Log in to TaskFlow to view and update your task.</p>
          <p style="color: #64748B; font-size: 12px; margin-top: 32px;">TaskFlow — Team Task Management</p>
        </div>
      `,
    });
    console.log(`[Email] Task assignment notification sent to ${toEmail}`);
  } catch (err) {
    // Don't throw — email failures should not break API responses
    console.error(`[Email] Failed to send notification: ${err.message}`);
  }
};

module.exports = { sendTaskAssignmentEmail };
