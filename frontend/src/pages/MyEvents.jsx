import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProposal, setEditingProposal] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:5001/api/users/proposals/user/${userId}`);
        
        if (response.data.success) {
          setEvents(response.data.data);
        } else {
          setError("Failed to fetch events");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
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
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
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
                      <span className="ml-2 text-sm capitalize">{event.status}</span>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default MyEvents;