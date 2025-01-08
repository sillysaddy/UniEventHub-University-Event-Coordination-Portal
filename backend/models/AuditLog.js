import mongoose from "mongoose";

// Schema for audit log
/**
 * Schema definition for audit logs.
 * 
 * @typedef {Object} AuditLog
 * @property {string} action - The action performed. Must be one of the following: 
 * 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'USER_LOGIN', 'ROLE_CHANGE', 
 * 'PROPOSAL_CREATE', 'PROPOSAL_UPDATE', 'PROPOSAL_REVIEW', 'SPONSOR_CREATE', 
 * 'SPONSOR_REVIEW', 'NOTIFICATION_CREATE'.
 * @property {mongoose.Schema.Types.ObjectId} performedBy - The ID of the user who performed the action. References the User model.
 * @property {mongoose.Schema.Types.ObjectId} [targetUser] - The ID of the target user, if applicable. References the User model.
 * @property {mongoose.Schema.Types.Mixed} details - Additional details about the action. Can be of any type.
 * @property {string} [ipAddress] - The IP address from which the action was performed.
 * @property {Date} timestamp - The timestamp when the action was performed. Defaults to the current date and time.
 * 
 * @property {Date} createdAt - The timestamp when the audit log was created. Automatically added by Mongoose.
 * @property {Date} updatedAt - The timestamp when the audit log was last updated. Automatically added by Mongoose.
 */
const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [  // Ensure action is one of the following
      'USER_CREATE',
      'USER_UPDATE',
      'USER_DELETE',
      'USER_LOGIN',
      'ROLE_CHANGE',
      'PROPOSAL_CREATE',
      'PROPOSAL_UPDATE',
      'PROPOSAL_REVIEW',
      'SPONSOR_CREATE',
      'SPONSOR_REVIEW',
      'NOTIFICATION_CREATE'
    ]
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Mixed type allows for flexible schema
    required: true
  },
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Add createdAt and updatedAt fields
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;