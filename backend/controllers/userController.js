import User from "../models/User.js";
import RoleChangeRequest from "../models/RoleChangeRequest.js";
import bcrypt from "bcryptjs";
import EventProposal from "../models/EventProposal.js"; // Add this import

export const createSystemAdmin = async (req, res) => {
  try {
    const newUser = await User.create({
      name: "John Doe",
      email: "john@example.com", 
      password: "password123",
      userId: "ID123",
      role: "system_admin"
    });

    // Don't send the password in response
    const { password, ...userData } = newUser._doc;
    
    res.status(201).json({
      success: true,
      message: "System admin created successfully",
      data: userData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create system admin",
      error: error.message
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, userId } = req.body;
    console.log("Registration attempt:", { name, email, userId }); // Log registration attempt

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log("User already exists:", email);
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user with club_representative role
    const newUser = await User.create({
      name,
      email,
      password,
      userId,
      role: "club_representative" // Default role
    });

    console.log("User created successfully:", newUser._id);

    // Remove password from response
    const { password: _, ...userData } = newUser._doc;
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: userData
    });

  } catch (error) {
    console.error("Registration error:", error); // Log the error
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Remove password from response
    const { password: _, ...userData } = user._doc;
    
    // Make sure to include _id in the response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        ...userData
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
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
      message: "Error fetching user profile",
      error: error.message
    });
  }
};

export const createRoleRequest = async (req, res) => {
  try {
    const { userId, currentRole, requestedRole, reason } = req.body;

    const newRequest = await RoleChangeRequest.create({
      user: userId,
      currentRole,
      requestedRole,
      reason
    });

    res.status(201).json({
      success: true,
      message: "Role change request created successfully",
      data: newRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating role request",
      error: error.message
    });
  }
};

export const getRoleRequests = async (req, res) => {
  try {
    const requests = await RoleChangeRequest.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching role requests",
      error: error.message
    });
  }
};

export const updateRoleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const roleRequest = await RoleChangeRequest.findById(requestId);
    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        message: "Role request not found"
      });
    }

    if (status === 'approved') {
      // Update user's role
      await User.findByIdAndUpdate(roleRequest.user, {
        role: roleRequest.requestedRole
      });
    }

    roleRequest.status = status;
    await roleRequest.save();

    res.status(200).json({
      success: true,
      message: `Role request ${status} successfully`,
      data: roleRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating role request",
      error: error.message
    });
  }
};

// Add this controller function
export const createProposal = async (req, res) => {
  try {
    console.log("Received proposal data:", req.body); // Debug log

    const { 
      title, 
      description, 
      budget, 
      clubName, 
      startDate, 
      endDate, 
      submittedBy 
    } = req.body;

    // Validate required fields
    if (!title || !description || !clubName || !startDate || !endDate || !submittedBy) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: {
          title: !title,
          description: !description,
          clubName: !clubName,
          startDate: !startDate,
          endDate: !endDate,
          submittedBy: !submittedBy
        }
      });
    }

    // Parse budget
    const parsedBudget = Number(budget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget amount"
      });
    }

    const newProposal = await EventProposal.create({
      title: title.trim(),
      description: description.trim(),
      budget: parsedBudget,
      clubName: clubName.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      submittedBy,
      status: "pending",
      needsRevision: false,
      allocatedBudget: 0,
      sponsorRequirement: 0
    });

    res.status(201).json({
      success: true,
      message: "Proposal created successfully",
      data: newProposal
    });

  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create proposal",
      error: error.message
    });
  }
};

// Add this controller function
export const getProposalsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const proposals = await EventProposal.find({ submittedBy: userId })
      .sort('-createdAt');

    if (!proposals) {
      return res.status(404).json({
        success: false,
        message: "No proposals found for this user"
      });
    }

    res.status(200).json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error("Error in getProposalsByUser:", error); // Add logging
    res.status(500).json({
      success: false,
      message: "Failed to fetch user proposals",
      error: error.message
    });
  }
};

// Add this controller function
export const updateProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await EventProposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found"
      });
    }

    if (proposal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending proposals can be modified"
      });
    }

    const updatedProposal = await EventProposal.findByIdAndUpdate(
      proposalId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Proposal updated successfully",
      data: updatedProposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update proposal",
      error: error.message
    });
  }
};


export const getProposalById = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await EventProposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found"
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposal",
      error: error.message
    });
  }
};

// Add to userController.js

// Get all pending proposals for OCA staff
export const getPendingProposals = async (req, res) => {
  try {
    const proposals = await EventProposal.find({ status: "pending" })
      .populate('submittedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: proposals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending proposals",
      error: error.message
    });
  }
};

// Update proposal status with comment
export const reviewProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { status, comment, allocatedBudget, sponsorRequirement, needsRevision } = req.body;

    // Normalize the status value and ensure it's not pending when approved
    const normalizedStatus = status === "approve" ? "approved" : 
                           status === "reject" ? "rejected" : 
                           "pending";

    const updatedProposal = await EventProposal.findByIdAndUpdate(
      proposalId,
      { 
        status: needsRevision ? "pending" : normalizedStatus,
        comment,
        allocatedBudget: normalizedStatus === "approved" ? Number(allocatedBudget) || 0 : 0,
        sponsorRequirement: normalizedStatus === "approved" ? Number(sponsorRequirement) || 0 : 0,
        needsRevision,
        $push: {
          revisionHistory: {
            comment,
            timestamp: new Date()
          }
        },
        reviewedAt: new Date()
      },
      { new: true }
    );

    if (!updatedProposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found"
      });
    }

    // Immediately fetch and return the updated proposal
    const refreshedProposal = await EventProposal.findById(proposalId)
      .populate('submittedBy', 'name email');

    res.status(200).json({
      success: true,
      message: needsRevision ? "Revision requested" : `Proposal ${normalizedStatus} successfully`,
      data: refreshedProposal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to review proposal",
      error: error.message
    });
  }
};

// Get all proposals for OCA staff
export const getAllProposals = async (req, res) => {
  try {
    const proposals = await EventProposal.find()
      .populate('submittedBy', 'name email')
      .sort('-createdAt');

    if (!proposals) {
      return res.status(404).json({
        success: false,
        message: "No proposals found"
      });
    }

    res.status(200).json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error("Error in getAllProposals:", error); // Add logging
    res.status(500).json({
      success: false,
      message: "Failed to fetch proposals",
      error: error.message
    });
  }
};