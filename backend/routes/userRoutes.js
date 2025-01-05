import express from "express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from "../models/User.js"; // Add this import
import AuditLog from '../models/AuditLog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
import EventProposal from "../models/EventProposal.js";
import Notification from "../models/Notification.js";
import Sponsor from "../models/Sponsor.js";
import { generateEventApprovalPDF, generateSponsorshipReport } from '../utils/pdfGenerator.js';

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

// Add this with other routes
router.get("/reports/sponsorship/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await EventProposal.findById(eventId)
      .populate({
        path: 'sponsors',
        populate: [
          { path: 'submittedBy', select: 'name' },
          { path: 'reviewedBy', select: 'name' }
        ]
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const pdfDetails = await generateSponsorshipReport(event);

    // Check if file exists before sending
    if (!fs.existsSync(pdfDetails.filepath)) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF"
      });
    }

    res.download(pdfDetails.filepath, pdfDetails.filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).json({
          success: false,
          message: "Error downloading file",
          error: err.message
        });
      }
      // Optional: Clean up file after download
      // fs.unlinkSync(pdfDetails.filepath);
    });
  } catch (error) {
    console.error("Generate sponsorship report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sponsorship report",
      error: error.message
    });
  }
});

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

// Sponsor routes
router.post("/sponsors/create", async (req, res) => {
  try {
    const { eventProposalId, sponsorName, amount, submittedBy } = req.body;

    const proposal = await EventProposal.findById(eventProposalId);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Event proposal not found"
      });
    }

    const sponsor = await Sponsor.create({
      eventProposal: eventProposalId,
      sponsorName,
      amount,
      submittedBy
    });

    // Add sponsor to event proposal
    proposal.sponsors = [...(proposal.sponsors || []), sponsor._id];
    await proposal.save();

    res.status(201).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create sponsor request",
      error: error.message
    });
  }
});

router.get("/sponsors/event/:eventId", async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ eventProposal: req.params.eventId })
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sponsors",
      error: error.message
    });
  }
});

router.patch("/sponsors/:sponsorId/review", async (req, res) => {
  try {
    const { status, reviewComment, reviewedBy } = req.body;
    const sponsor = await Sponsor.findById(req.params.sponsorId);
    
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: "Sponsor request not found"
      });
    }

    // Update sponsor status and review details
    sponsor.status = status;
    sponsor.reviewComment = reviewComment;
    sponsor.reviewedBy = reviewedBy;
    sponsor.reviewedAt = new Date();
    await sponsor.save();

    // If approved, update event's sponsorship amount
    if (status === 'approved') {
      const event = await EventProposal.findById(sponsor.eventProposal);
      if (event) {
        event.sponsorRequirement = Math.max(0, event.sponsorRequirement - sponsor.amount);
        await event.save();
      }
    }

    res.status(200).json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to review sponsor request",
      error: error.message
    });
  }
});

// Add this route to get pending sponsor requests
router.get("/sponsors/pending", async (req, res) => {
  try {
    const sponsors = await Sponsor.find({ status: "pending" })
      .populate('eventProposal', 'title clubName budget sponsorRequirement')
      .populate('submittedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending sponsor requests",
      error: error.message
    });
  }
});

// Add this route to get all sponsors
router.get("/sponsors/all", async (req, res) => {
  try {
    const sponsors = await Sponsor.find()
      .populate('eventProposal', 'title clubName')
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: sponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sponsors",
      error: error.message
    });
  }
});

// Add these with other routes
router.get("/users/all", async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
});

router.patch("/users/:userId/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message
    });
  }
});

router.delete("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role === 'system_admin') {
      return res.status(403).json({
        success: false,
        message: "Cannot delete system admin"
      });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
});

// Add this route to get audit logs
router.get("/audit-logs", async (req, res) => {
  try {
    const { page = 1, limit = 10, action, startDate, endDate } = req.query;

    let query = {};

    // Filter by action if provided
    if (action && action !== '') {
      query.action = action;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate && startDate !== '') {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate && endDate !== '') {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email')
      .populate('targetUser', 'name email')
      .sort('-timestamp')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs",
      error: error.message
    });
  }
});

export default router;