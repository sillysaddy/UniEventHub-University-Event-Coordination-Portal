import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
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
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;