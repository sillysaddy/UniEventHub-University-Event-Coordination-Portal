import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DollarSign, Calendar, ArrowLeft, Download } from "lucide-react";

const SponsorshipTracking = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        // Get user role first
        const userResponse = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        setUserRole(userResponse.data.data.role);

        // Fetch all sponsor data
        const response = await axios.get("http://localhost:5001/api/users/sponsors/all");
        if (response.data.success) {
          setSponsors(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching sponsors:", err);
        setError("Failed to fetch sponsorship data");
      } finally {
        setLoading(false);
      }
    };

    fetchSponsors();
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sponsorship Tracking</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage sponsorship contributions
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Sponsorships</h3>
            <div className="flex items-center text-3xl font-bold text-primary">
              <DollarSign className="h-8 w-8 mr-2" />
              {sponsors.reduce((sum, sponsor) => 
                sponsor.status === 'approved' ? sum + sponsor.amount : sum, 0
              )} BDT
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Requests</h3>
            <div className="text-3xl font-bold text-yellow-500">
              {sponsors.filter(sponsor => sponsor.status === 'pending').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Approved Sponsors</h3>
            <div className="text-3xl font-bold text-green-500">
              {sponsors.filter(sponsor => sponsor.status === 'approved').length}
            </div>
          </div>
        </div>

        {/* Sponsorship List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Sponsorship History</h2>
          </div>
          
          <div className="divide-y">
            {sponsors.map((sponsor) => (
              <div key={sponsor._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {sponsor.sponsorName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Event: {sponsor.eventProposal?.title}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sponsor.status === 'approved' ? 'bg-green-100 text-green-800' :
                    sponsor.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sponsor.status}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Amount:</span>{' '}
                    <span className="font-medium">{sponsor.amount} BDT</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted By:</span>{' '}
                    <span className="font-medium">{sponsor.submittedBy?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted On:</span>{' '}
                    <span className="font-medium">
                      {new Date(sponsor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {sponsor.reviewedBy && (
                    <div>
                      <span className="text-gray-500">Reviewed By:</span>{' '}
                      <span className="font-medium">{sponsor.reviewedBy?.name}</span>
                    </div>
                  )}
                </div>

                {sponsor.reviewComment && (
                  <div className="mt-4 text-sm">
                    <span className="text-gray-500">Review Comment:</span>{' '}
                    <p className="mt-1 text-gray-700">{sponsor.reviewComment}</p>
                  </div>
                )}

                {/* Add this in the sponsor details section */}
                {sponsor.status === 'approved' && (
                  <button
                    onClick={() => {
                      const downloadUrl = `http://localhost:5001/api/users/reports/sponsorship/${sponsor.eventProposal._id}`;
                      window.open(downloadUrl, '_blank');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipTracking;