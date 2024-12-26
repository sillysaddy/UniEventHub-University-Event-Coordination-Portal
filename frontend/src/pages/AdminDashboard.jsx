import { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/users/role-requests");
      // Filter to show only pending requests
      const pendingRequests = response.data.data.filter(request => request.status === "pending");
      setRoleRequests(pendingRequests);
    } catch (err) {
      setError("Failed to fetch role change requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (requestId, action) => {
    try {
      await axios.patch(`http://localhost:5001/api/users/role-request/${requestId}`, {
        status: action
      });
      alert(`Request ${action} successfully`);
      // Remove the processed request from the UI
      setRoleRequests(prevRequests => 
        prevRequests.filter(request => request._id !== requestId)
      );
    } catch (err) {
      setError(`Failed to ${action} request`);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Pending Role Change Requests</h1>
          
          {roleRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending role change requests</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roleRequests.map((request) => (
                    <tr key={request._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{request.user.name}</div>
                          <div className="text-sm text-gray-500">{request.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.currentRole}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.requestedRole}</td>
                      <td className="px-6 py-4">{request.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRoleChange(request._id, 'approved')}
                          className="mr-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRoleChange(request._id, 'rejected')}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;