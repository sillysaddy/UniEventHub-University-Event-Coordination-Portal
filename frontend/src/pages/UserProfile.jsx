import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  UserCircle, 
  Mail, 
  IdCard, 
  UserCog,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Send,
  ClipboardList
} from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [roleChangeRequest, setRoleChangeRequest] = useState({
    requestedRole: "",
    reason: ""
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Assuming we have the user ID stored in localStorage after login
        const userId = localStorage.getItem("userId");
        const response = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        setUserInfo(response.data.data);
      } catch (err) {
        setError("Failed to fetch user information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleRoleChangeRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5001/api/users/role-request", {
        userId: userInfo._id,
        currentRole: userInfo.role,
        ...roleChangeRequest
      });
      setSuccess("Role change request submitted successfully!");
    } catch (err) {
      setError("Failed to submit role change request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Dashboard
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-2 text-green-500 bg-green-50 px-4 py-3 rounded-lg">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Information Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <UserCircle className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <UserCircle className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="mt-1 font-medium text-gray-900">{userInfo?.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="mt-1 font-medium text-gray-900">{userInfo?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <IdCard className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="mt-1 font-medium text-gray-900">{userInfo?.userId}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-600">
                <UserCog className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Role</p>
                  <span className="mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {userInfo?.role.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Change Request Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b">
              <ClipboardList className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Request Role Change</h2>
            </div>

            <form onSubmit={handleRoleChangeRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Requested Role
                </label>
                <select
                  value={roleChangeRequest.requestedRole}
                  onChange={(e) => setRoleChangeRequest(prev => ({
                    ...prev,
                    requestedRole: e.target.value
                  }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="">Select a role</option>
                  <option value="club_representative">Club Representative</option>
                  <option value="oca_staff">OCA Staff</option>
                  <option value="advisor">Advisor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reason for Change
                </label>
                <textarea
                  value={roleChangeRequest.reason}
                  onChange={(e) => setRoleChangeRequest(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  rows={4}
                  placeholder="Please provide a reason for your role change request..."
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;