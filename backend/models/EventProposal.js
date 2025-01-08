import mongoose from "mongoose";

// Schema for EventProposal
/**
 * EventProposal Schema
 * 
 * Represents a proposal for an event submitted by a club.
 * 
 * @typedef {Object} EventProposal
 * @property {string} title - The title of the event proposal. Required.
 * @property {string} description - The description of the event proposal. Required.
 * @property {number} budget - The proposed budget for the event. Required, must be non-negative.
 * @property {number} allocatedBudget - The budget allocated for the event. Default is 0.
 * @property {number} sponsorRequirement - The amount of sponsorship required for the event. Default is 0.
 * @property {string} clubName - The name of the club submitting the proposal. Required.
 * @property {string} [documents] - URL or file path to supporting documents. Optional.
 * @property {string} status - The status of the proposal. Can be "pending", "approved", or "rejected". Default is "pending".
 * @property {mongoose.Schema.Types.ObjectId} submittedBy - Reference to the user who submitted the proposal. Required.
 * @property {Date} startDate - The start date of the event. Required.
 * @property {Date} endDate - The end date of the event. Required.
 * @property {string} [comment] - Comments on the proposal. Default is null.
 * @property {Date} [reviewedAt] - The date when the proposal was reviewed. Default is null.
 * @property {boolean} needsRevision - Indicates if the proposal needs revision. Default is false.
 * @property {Array<Object>} revisionHistory - History of revisions made to the proposal.
 * @property {string} revisionHistory.comment - Comment on the revision.
 * @property {Date} revisionHistory.timestamp - Timestamp of the revision. Default is current date and time.
 * @property {mongoose.Schema.Types.ObjectId} [reviewedBy] - Reference to the user who reviewed the proposal. Default is null.
 * @property {string} [approvalDocument] - Filename of the approval document (PDF). Default is null.
 * @property {Array<Object>} advisorComments - Comments made by advisors.
 * @property {string} advisorComments.comment - Comment made by the advisor. Required.
 * @property {mongoose.Schema.Types.ObjectId} advisorComments.advisorId - Reference to the advisor (user) who made the comment. Required.
 * @property {Date} advisorComments.createdAt - Timestamp when the comment was created. Default is current date and time.
 * @property {Array<mongoose.Schema.Types.ObjectId>} sponsors - References to sponsors of the event.
 * @property {Date} createdAt - Timestamp when the proposal was created. Automatically managed by Mongoose.
 * @property {Date} updatedAt - Timestamp when the proposal was last updated. Automatically managed by Mongoose.
 */
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