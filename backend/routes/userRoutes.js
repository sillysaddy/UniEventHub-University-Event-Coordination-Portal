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
  updateProposal, // Add this import
  getProposalById // Add this import
} from "../controllers/userController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/create-admin", createSystemAdmin);

// Proposal routes
router.post("/proposals/create", createProposal);
router.get("/proposals/user/:userId", getProposalsByUser);
router.patch("/proposals/:proposalId", updateProposal);
// Add this route to get a single proposal
router.get("/proposals/:proposalId", getProposalById);

// Profile and role routes
router.get("/profile/:userId", getUserProfile);
router.post("/role-request", createRoleRequest);
router.get("/role-requests", getRoleRequests);
router.patch("/role-request/:requestId", updateRoleRequest);

export default router;