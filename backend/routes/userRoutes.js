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
  getAllProposals
} from "../controllers/userController.js";

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

// Profile and role routes
router.get("/profile/:userId", getUserProfile);
router.post("/role-request", createRoleRequest);
router.get("/role-requests", getRoleRequests);
router.patch("/role-request/:requestId", updateRoleRequest);

export default router;