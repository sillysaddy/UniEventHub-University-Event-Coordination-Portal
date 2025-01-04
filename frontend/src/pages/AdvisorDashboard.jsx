// frontend/src/pages/AdvisorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Clock, DollarSign, Download } from "lucide-react";

const AdvisorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
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