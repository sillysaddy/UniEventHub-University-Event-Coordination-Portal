import { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      alert("Role change request submitted successfully!");
    } catch (err) {
      setError("Failed to submit role change request");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">User Profile</h1>
          
          {/* User Information */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1">{userInfo?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1">{userInfo?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User ID</label>
              <p className="mt-1">{userInfo?.userId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Current Role</label>
              <p className="mt-1">{userInfo?.role}</p>
            </div>
          </div>

          {/* Role Change Request Form */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Request Role Change</h2>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
              >
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