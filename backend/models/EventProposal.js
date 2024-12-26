import mongoose from "mongoose";

const eventProposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    clubName: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
    },
    documents: {
      type: String, // URL or file path
      required: false // Make it optional
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
  },
  {
    timestamps: true,
  }
);

const EventProposal = mongoose.model("EventProposal", eventProposalSchema);
export default EventProposal;