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
import Notification from "../models/Notification.js";

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

// Add this with other routes
router.post("/proposals/:proposalId/advisor-comment", async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { comment, advisorId } = req.body;

    const proposal = await EventProposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found"
      });
    }

    proposal.advisorComments.push({
      comment,
      advisorId
    });

    await proposal.save();

    const updatedProposal = await EventProposal.findById(proposalId)
      .populate('advisorComments.advisorId', 'name userId');

    res.status(200).json({
      success: true,
      data: updatedProposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add advisor comment",
      error: error.message
    });
  }
});

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

// Notification routes
router.post("/notifications", async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const createdBy = req.body.userId;

    const notification = await Notification.create({
      title,
      message,
      type,
      createdBy
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('createdBy', 'name role');

    res.status(201).json({
      success: true,
      data: populatedNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message
    });
  }
});

router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('createdBy', 'name role')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
});

router.patch("/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Add user to isRead array if not already present
    if (!notification.isRead.some(read => read.user.toString() === userId)) {
      notification.isRead.push({ user: userId });
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message
    });
  }
});

export default router;