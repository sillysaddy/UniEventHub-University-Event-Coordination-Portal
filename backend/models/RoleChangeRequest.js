import mongoose from "mongoose";
// Schema for role change request
/**
 * Schema for Role Change Request.
 * 
 * @typedef {Object} RoleChangeRequest
 * @property {mongoose.Schema.Types.ObjectId} user - Reference to the User requesting the role change.
 * @property {string} currentRole - The current role of the user.
 * @property {string} requestedRole - The role that the user is requesting.
 * @property {string} reason - The reason for the role change request.
 * @property {string} status - The status of the request, can be "pending", "approved", or "rejected". Default is "pending".
 * @property {Date} createdAt - Timestamp when the request was created.
 * @property {Date} updatedAt - Timestamp when the request was last updated.
 */
const roleChangeRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentRole: {
      type: String,
      required: true,
    },
    requestedRole: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const RoleChangeRequest = mongoose.model("RoleChangeRequest", roleChangeRequestSchema);
export default RoleChangeRequest;