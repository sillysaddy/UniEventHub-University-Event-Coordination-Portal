import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Add this import
import { 
  UserCog, 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Users,
  Activity,
  ArrowLeft,
  Shield,
  RefreshCcw,
  Loader2,
  LogOut // Add LogOut icon
} from "lucide-react";
import AuditLogViewer from '../components/AuditLogViewer';

const AdminDashboard = () => {
  const [roleRequests, setRoleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Add navigate hook

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

  // Add logout handler
  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/users"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
              >
                <Users className="h-5 w-5 mr-2" />
                Manage Users
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-2xl font-bold text-gray-900">{roleRequests.length}</h3>
              </div>
            </div>
          </div>
          {/* Add more stat cards as needed */}
        </div>

        {/* Role Requests Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCog className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">Role Change Requests</h2>
              </div>
              <button 
                onClick={fetchRoleRequests}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCcw className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 px-6">
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          ) : roleRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <ClipboardCheck className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-center">No pending role change requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roleRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">{request.user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{request.user.name}</div>
                            <div className="text-sm text-gray-500">{request.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {request.currentRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {request.requestedRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{request.reason}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleRoleChange(request._id, 'approved')}
                          className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRoleChange(request._id, 'rejected')}
                          className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
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

        {/* Audit Logs Section */}
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">System Audit Logs</h2>
          </div>
          <AuditLogViewer />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;