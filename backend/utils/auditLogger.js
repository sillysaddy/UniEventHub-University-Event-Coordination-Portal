import AuditLog from '../models/AuditLog.js';

export const logActivity = async ({
  action,
  performedBy,
  targetUser = null,
  details = {},
  ipAddress = null
}) => {
  try {
    // Create log entry
    const log = await AuditLog.create({
      action,
      performedBy,
      targetUser,
      details,
      ipAddress
    });

    // Populate user references
    await log.populate([
      { path: 'performedBy', select: 'name email' },
      { path: 'targetUser', select: 'name email' }
    ]);

    return log;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to prevent disrupting main operations
    return null;
  }
};