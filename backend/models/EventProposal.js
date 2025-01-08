import mongoose from "mongoose";

// Schema for EventProposal
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
    allocatedBudget: {
      type: Number,
      default: 0
    },
    sponsorRequirement: {
      type: Number,
      default: 0
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
    comment: {
      type: String,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    needsRevision: {
      type: Boolean,
      default: false
    },
    revisionHistory: [{
      comment: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    approvalDocument: {
      type: String, // This will store the PDF filename
      default: null
    },
    advisorComments: [{
      comment: {
        type: String,
        required: true
      },
      advisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    sponsors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sponsor' // Reference to Sponsor model
    }]
  },
  {
    timestamps: true,
  }
);

const EventProposal = mongoose.model("EventProposal", eventProposalSchema);
export default EventProposal;