import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  UserCircle, 
  ArrowLeft, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield,
  Users,
  Search,
  RefreshCcw,
  Edit,
  UserCog,
  Loader2
} from "lucide-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editRole, setEditRole] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const roles = [
    "club_representative",
    "oca_staff",
    "advisor",
    "system_admin"
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/users/users/all");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.patch(
        `http://localhost:5001/api/users/users/${userId}/role`,
        { role: newRole }
      );

      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId ? response.data.data : user
        ));
        setSelectedUser(null);
        setEditRole("");
        setActionSuccess("Role updated successfully");
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5001/api/users/users/${userId}`
      );

      if (response.data.success) {
        setUsers(users.filter(user => user._id !== userId));
        setShowConfirmDelete(false);
        setSelectedUser(null);
        setActionSuccess("User deleted successfully");
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">Manage system users and their roles</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
              </div>
            </div>
          </div>
          {/* Add more stat cards as needed */}
        </div>

        {/* Messages */}
        {actionSuccess && (
          <div className="mb-6 flex items-center gap-2 text-green-500 bg-green-50 px-4 py-3 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Users Table Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCog className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">System Users</h2>
              </div>
              <button 
                onClick={fetchUsers}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh Users"
              >
                <RefreshCcw className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-primary font-medium">{user.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{user.userId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selectedUser?._id === user._id ? (
                          <select
                            value={editRole || user.role}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          >
                            {roles.map(role => (
                              <option key={role} value={role}>
                                {role.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {user.role.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {selectedUser?._id === user._id ? (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleRoleChange(user._id, editRole)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(null);
                                setEditRole("");
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setEditRole(user.role);
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Role
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowConfirmDelete(true);
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user <span className="font-medium">{selectedUser.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;