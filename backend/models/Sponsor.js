import mongoose from "mongoose";

// Schema for Sponsor
/**
 * Sponsor Schema
 * 
 * Represents a sponsor for an event proposal.
 * 
 * @typedef {Object} Sponsor
 * @property {mongoose.Schema.Types.ObjectId} eventProposal - Reference to the EventProposal model.
 * @property {string} sponsorName - Name of the sponsor.
 * @property {number} amount - Sponsorship amount, must be a non-negative number.
 * @property {string} status - Status of the sponsorship, can be 'pending', 'approved', or 'rejected'. Defaults to 'pending'.
 * @property {mongoose.Schema.Types.ObjectId} submittedBy - Reference to the User model who submitted the sponsorship.
 * @property {mongoose.Schema.Types.ObjectId} [reviewedBy=null] - Reference to the User model who reviewed the sponsorship. Defaults to null.
 * @property {string} [reviewComment=null] - Comment provided by the reviewer. Defaults to null.
 * @property {Date} [reviewedAt=null] - Date when the sponsorship was reviewed. Defaults to null.
 * @property {Date} createdAt - Timestamp when the sponsorship was created.
 * @property {Date} updatedAt - Timestamp when the sponsorship was last updated.
 */
const sponsorSchema = new mongoose.Schema({
  eventProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventProposal', // Reference to EventProposal model
    required: true
  },
  sponsorName: { 
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount cannot be negative"]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewComment: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Sponsor = mongoose.model("Sponsor", sponsorSchema);
export default Sponsor;