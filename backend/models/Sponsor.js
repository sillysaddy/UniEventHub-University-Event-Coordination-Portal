import mongoose from "mongoose";

const sponsorSchema = new mongoose.Schema({
  eventProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventProposal',
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