import express from "express";
import { 
  createSystemAdmin, 
  registerUser, 
  loginUser,
  getUserProfile,
  createRoleRequest,
  getRoleRequests,
  updateRoleRequest,
  createProposal,
  getProposalsByUser,
  updateProposal,
  getProposalById,
  getPendingProposals,
  reviewProposal,
  getAllProposals,
  downloadReport
} from "../controllers/userController.js";
import EventProposal from "../models/EventProposal.js"; // Add this import

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create-admin", createSystemAdmin);

// Proposal routes
router.get("/proposals/all", getAllProposals);
router.get("/proposals/pending", getPendingProposals);
router.post("/proposals/create", createProposal);
router.get("/proposals/user/:userId", getProposalsByUser);
router.get("/proposals/:proposalId", getProposalById);
router.patch("/proposals/:proposalId", updateProposal);
router.patch("/proposals/:proposalId/review", reviewProposal);

// Update the advisor route with proper error handling
router.get("/proposals/advisor/approved", async (req, res) => {
  try {
    const approvedProposals = await EventProposal.find({ 
      status: "approved" 
    })
    .populate('submittedBy', 'name email')
    .populate('reviewedBy', 'name userId')
    .sort({ reviewedAt: -1 });

    if (!approvedProposals) {
      return res.status(404).json({
        success: false,
        message: "No approved proposals found"
      });
    }

    res.status(200).json({
      success: true,
      data: approvedProposals
    });
  } catch (error) {
    console.error("Error fetching approved proposals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch approved proposals",
      error: error.message
    });
  }
});

// Profile and role routes
router.get("/profile/:userId", getUserProfile);
router.post("/role-request", createRoleRequest);
router.get("/role-requests", getRoleRequests);
router.patch("/role-request/:requestId", updateRoleRequest);

// Report routes
router.get("/reports/:filename", downloadReport);

export default router;