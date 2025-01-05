import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import SponsorForm from '../components/SponsorForm';

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProposal, setEditingProposal] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [allocatedBudget, setAllocatedBudget] = useState(''); // Change from 0 to empty string
  const [reviewAction, setReviewAction] = useState("need_revision");
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [pendingSponsors, setPendingSponsors] = useState([]);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [sponsorReviewComment, setSponsorReviewComment] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        // First get user role
        const userResponse = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        setUserRole(userResponse.data.data.role);

        let response;
        if (userResponse.data.data.role === "oca_staff") {
          response = await axios.get("http://localhost:5001/api/users/proposals/all");
          fetchPendingSponsors();
        } else {
          response = await axios.get(`http://localhost:5001/api/users/proposals/user/${userId}`);
        }
        
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const fetchPendingSponsors = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/users/sponsors/pending");
      setPendingSponsors(response.data.data);
    } catch (error) {
      console.error("Error fetching pending sponsors:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-5 w-5" />;
      case "rejected":
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const handleEdit = (proposal) => {
    if (proposal.status !== "pending") {
      alert("Only pending proposals can be modified");
      return;
    }
    setEditingProposal(proposal);
  };

  const handleUpdate = async (updatedData) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/users/proposals/${editingProposal._id}`,
        updatedData
      );
      
      if (response.data.success) {
        // Update the events list
        setEvents(events.map(event => 
          event._id === editingProposal._id ? response.data.data : event
        ));
        setEditingProposal(null);
      }
    } catch (err) {
      setError("Failed to update proposal");
    }
  };

  // Add this function to handle refreshing events
  const refreshEvents = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userResponse = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
      
      let response;
      if (userResponse.data.data.role === "oca_staff") {
        response = await axios.get("http://localhost:5001/api/users/proposals/all");
      } else {
        response = await axios.get(`http://localhost:5001/api/users/proposals/user/${userId}`);
      }
      
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      console.error("Error refreshing events:", err);
    }
  };

  // Update handleProposalAction function
  const handleProposalAction = async (proposalId) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/users/proposals/${proposalId}/review`,
        {
          status: reviewAction === "need_revision" ? "pending" : reviewAction,
          comment: reviewComment,
          allocatedBudget: reviewAction === "approve" ? (parseFloat(allocatedBudget) || 0) : 0,
          sponsorRequirement: reviewAction === "approve" ? 
            (selectedProposal.budget - (parseFloat(allocatedBudget) || 0)) : 0,
          needsRevision: reviewAction === "need_revision",
          ocaOfficerId: localStorage.getItem("userId")
        }
      );

      if (response.data.success) {
        await refreshEvents();
        setSelectedProposal(null);
        setReviewComment("");
        setAllocatedBudget('');
        setReviewAction("need_revision");
      }
    } catch (err) {
      setError("Failed to update proposal status");
    }
  };

  const handleSponsorReview = async (sponsorId, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/users/sponsors/${sponsorId}/review`,
        {
          status,
          reviewComment: sponsorReviewComment,
          reviewedBy: localStorage.getItem("userId")
        }
      );

      if (response.data.success) {
        // Refresh both sponsors and events lists
        fetchPendingSponsors();
        refreshEvents();
        setSelectedSponsor(null);
        setSponsorReviewComment("");
      }
    } catch (error) {
      console.error("Error reviewing sponsor:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {userRole === "oca_staff" ? "Proposed Events" : "My Events"}
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <div className={`flex items-center ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="ml-2 text-sm capitalize">
                        {event.status.toLowerCase() === "approve" ? "approved" : event.status}
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Budget: {event.budget} BDT</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Submitted on {new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Budget Information */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Total Budget: {event.budget} BDT</span>
                    </div>
                    
                    {event.status === "approved" && (
                      <>
                        <div className="flex items-center text-sm text-green-500">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>OCA Allocated: {event.allocatedBudget} BDT</span>
                        </div>
                        <div className="flex items-center text-sm text-blue-500">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>Sponsor Required: {event.sponsorRequirement} BDT</span>
                        </div>
                      </>
                    )}
                  </div>

                  {event.status === "pending" && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => navigate(`/edit-proposal/${event._id}`)}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                      >
                        Edit Proposal
                      </button>
                    </div>
                  )}

                  {/* Add review buttons for OCA staff */}
                  {userRole === "oca_staff" && event.status === "pending" && (
                    <div className="p-4 border-t">
                      <button
                        onClick={() => setSelectedProposal(event)}
                        className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Review Proposal
                      </button>
                    </div>
                  )}

                  {/* Show review comments for club representatives */}
                  {userRole === "club_representative" && event.comment && (
                    <div className="p-4 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Review Comment:</strong> {event.comment}
                      </p>
                    </div>
                  )}

                  {/* Revision Status */}
                  {event.needsRevision && (
                    <div className="p-4 border-t">
                      <p className="text-sm text-yellow-600">
                        <strong>Needs Revision:</strong> {event.comment}
                      </p>
                    </div>
                  )}

{/* Download button section */}
{event.status === "approved" && (
  <div className="mt-4 border-t pt-4">
    <button
      onClick={() => {
        if (!event.approvalDocument) {
          alert("Approval document not found. Please contact OCA staff.");
          return;
        }
        const downloadUrl = `http://localhost:5001/api/users/reports/${event.approvalDocument}`;
        window.open(downloadUrl, '_blank');
      }}
      className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Approval Certificate
    </button>
  </div>
)}

{/* Add this after the existing download button */}
{event.status === "approved" && (
  <div className="mt-2">
    <button
      onClick={() => {
        const downloadUrl = `http://localhost:5001/api/users/reports/sponsorship/${event._id}`;
        window.open(downloadUrl, '_blank');
      }}
      className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Sponsorship Report
    </button>
  </div>
)}

{/* Add this after the review comments section */}
{event.advisorComments && event.advisorComments.length > 0 && (
  <div className="mt-4 border-t pt-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2">Advisor Comments</h4>
    {event.advisorComments.map((comment, index) => (
      <div key={index} className="mt-2 text-sm bg-blue-50 p-3 rounded">
        <p className="text-gray-600">{comment.comment}</p>
        <p className="text-xs text-gray-500 mt-1">
          {comment.advisorId.name} - {new Date(comment.createdAt).toLocaleString()}
        </p>
      </div>
    ))}
  </div>
)}

{/* Add Sponsor button */}
{event.status === "approved" && event.sponsorRequirement > 0 && userRole === "club_representative" && (
  <div className="mt-4 border-t pt-4">
    <button
      onClick={() => {
        setSelectedEvent(event);
        setShowSponsorForm(true);
      }}
      className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
    >
      Add Sponsor
    </button>
  </div>
)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Sponsor Requests Section */}
      {userRole === "oca_staff" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Pending Sponsor Requests</h2>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {pendingSponsors.length} Pending
              </span>
            </div>
            
            {pendingSponsors.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-500">There are no sponsor requests waiting for review.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingSponsors.map((sponsor) => (
                  <div 
                    key={sponsor._id} 
                    className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {sponsor.eventProposal.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {sponsor.eventProposal.clubName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending Review
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Sponsor Name</span>
                        <span className="font-medium">{sponsor.sponsorName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Offered Amount</span>
                        <span className="font-medium text-green-600">{sponsor.amount} BDT</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Required Amount</span>
                        <span className="font-medium text-blue-600">
                          {sponsor.eventProposal.sponsorRequirement} BDT
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Submitted By</span>
                        <span className="font-medium">{sponsor.submittedBy.name}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSponsor(sponsor)}
                      className="w-full py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 
                                transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Review Request</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editingProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Edit Proposal</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(editingProposal);
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={editingProposal.title}
                  onChange={(e) => setEditingProposal({
                    ...editingProposal,
                    title: e.target.value
                  })}
                  className="block w-full px-4 py-2 border rounded-md"
                />
                {/* Add other fields similarly */}
              </div>
              
              <div className="mt-4 flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProposal(null)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Review Proposal</h2>
            
            <div className="space-y-4 mb-6">
              {/* Budget Information */}
              <div>
                <h3 className="font-medium mb-2">Budget Information</h3>
                <p className="text-sm text-gray-600">Requested Budget: {selectedProposal.budget} BDT</p>
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Comment
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                  placeholder="Enter your feedback for the club representative..."
                />
              </div>

              {/* Budget Allocation (only show when approving) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Action
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="action"
                      value="need_revision"
                      checked={reviewAction === "need_revision"}
                      onChange={(e) => setReviewAction(e.target.value)}
                    />
                    <span className="ml-2">Request Revision</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="action"
                      value="approve"
                      checked={reviewAction === "approve"}
                      onChange={(e) => setReviewAction(e.target.value)}
                    />
                    <span className="ml-2">Approve</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="action"
                      value="reject"
                      checked={reviewAction === "reject"}
                      onChange={(e) => setReviewAction(e.target.value)}
                    />
                    <span className="ml-2">Reject</span>
                  </label>
                </div>
              </div>

              {reviewAction === "approve" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Allocation (BDT)
                  </label>
                  <input
                    type="text" // Change from number to text
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter amount to allocate"
                    value={allocatedBudget}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and empty string
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        const numValue = value === '' ? '' : parseFloat(value);
                        if (value === '' || !isNaN(numValue)) {
                          if (numValue <= selectedProposal.budget) {
                            setAllocatedBudget(value);
                          }
                        }
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Remaining for sponsor: {(selectedProposal.budget - (parseFloat(allocatedBudget) || 0)).toFixed(2)} BDT
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleProposalAction(selectedProposal._id)}
                className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Submit Review
              </button>
              <button
                onClick={() => {
                  setSelectedProposal(null);
                  setReviewComment("");
                  setAllocatedBudget(0);
                  setReviewAction("need_revision");
                }}
                className="flex-1 py-2 px-4 border rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sponsor Form Modal */}
      {showSponsorForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <SponsorForm
              event={selectedEvent}
              onSubmit={() => {
                setShowSponsorForm(false);
                setSelectedEvent(null);
                refreshEvents();
              }}
              onCancel={() => {
                setShowSponsorForm(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Sponsor Review Modal */}
      {selectedSponsor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Review Sponsor Request</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Comment
                </label>
                <textarea
                  value={sponsorReviewComment}
                  onChange={(e) => setSponsorReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Add your review comment..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleSponsorReview(selectedSponsor._id, 'approved')}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleSponsorReview(selectedSponsor._id, 'rejected')}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setSelectedSponsor(null);
                    setSponsorReviewComment("");
                  }}
                  className="flex-1 py-2 px-4 border rounded-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;