// frontend/src/pages/AdvisorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, DollarSign, Download } from "lucide-react";

// Add this helper function at the top of the component
const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return { label: "Upcoming", className: "text-blue-500" };
  } else if (now > end) {
    return { label: "Finished", className: "text-gray-500" };
  } else {
    return { label: "Ongoing", className: "text-green-500" };
  }
};

const AdvisorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedEvents = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5001/api/users/proposals/advisor/approved");
        if (response.data.success) {
          setEvents(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch approved events");
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedEvents();
  }, [navigate]);

  const handleAddComment = async (eventId) => {
    try {
      const advisorId = localStorage.getItem("userId");
      const response = await axios.post(
        `http://localhost:5001/api/users/proposals/${eventId}/advisor-comment`,
        {
          comment,
          advisorId
        }
      );
      
      if (response.data.success) {
        // Update events list with new comment
        setEvents(events.map(event => 
          event._id === eventId ? response.data.data : event
        ));
        setComment("");
        setSelectedEventId(null);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
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
        <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Approved Events</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No approved events found</p>
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
                    {/* Add this status display */}
                    <span className={`${getEventStatus(event.startDate, event.endDate).className} text-sm font-medium`}>
                      {getEventStatus(event.startDate, event.endDate).label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{event.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} -{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Approved on {new Date(event.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Total Budget: {event.budget} BDT</span>
                    </div>
                    <div className="flex items-center text-sm text-green-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>OCA Allocated: {event.allocatedBudget} BDT</span>
                    </div>
                    <div className="flex items-center text-sm text-blue-500">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>Sponsor Required: {event.sponsorRequirement} BDT</span>
                    </div>
                  </div>

                  {/* Advisor Comments Section */}
                  <div className="mt-4 border-t pt-4">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Advisor Comments</h4>
                      {event.advisorComments?.map((comment, index) => (
                        <div key={index} className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <p>{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Comment Form */}
                    <div className="mt-3">
                      {selectedEventId === event._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:ring-primary"
                            placeholder="Add your comment..."
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedEventId(null)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddComment(event._id)}
                              className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                            >
                              Add Comment
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedEventId(event._id)}
                          className="text-sm text-primary hover:text-primary/90"
                        >
                          Add Comment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Download Report Button */}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorDashboard;