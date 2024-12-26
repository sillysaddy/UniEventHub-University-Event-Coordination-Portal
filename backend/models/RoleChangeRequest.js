import mongoose from "mongoose";

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