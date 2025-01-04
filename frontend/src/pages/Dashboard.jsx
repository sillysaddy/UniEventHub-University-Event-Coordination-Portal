import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  UserCircle, 
  LogOut, 
  FileText, 
  Calendar,
  Settings,
  Bell
} from "lucide-react";
import NotificationPanel from '../components/NotificationPanel';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("Please login first");
          navigate("/login");
          return;
        }
        
        const response = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        if (response.data.success) {
          setUserInfo(response.data.data);
          
          if (response.data.data.role === "system_admin") {
            navigate("/admin/dashboard");
            return;
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to fetch user information");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
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
        <div className="text-red-500 bg-red-50 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {userInfo?.name}</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem("userId");
                  navigate("/login");
                }}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Link
            to="/profile"
            className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
          >
            <UserCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
            <p className="mt-2 text-sm text-gray-500">
              View and manage your profile information
            </p>
          </Link>

          {/* Create Proposal Card - Only for club representatives */}
          {userInfo?.role === "club_representative" && (
            <Link
              to="/create-proposal"
              className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
            >
              <FileText className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Create Proposal</h3>
              <p className="mt-2 text-sm text-gray-500">
                Submit a new event proposal
              </p>
            </Link>
          )}

          {/* My Events Card - For club representatives */}
          {userInfo?.role === "club_representative" && (
            <Link
              to="/my-events"
              className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
            >
              <Calendar className="h-12 w-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">My Events</h3>
              <p className="mt-2 text-sm text-gray-500">
                View and manage your event proposals
              </p>
            </Link>
          )}

          {/* Proposed Events Card - For OCA staff */}
          {userInfo?.role === "oca_staff" && (
            <Link
              to="/my-events"
              className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
            >
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Proposed Events</h3>
              <p className="mt-2 text-sm text-gray-500">
                Review and manage event proposals
              </p>
            </Link>
          )}

          {/* Advisor Events Card - For advisors */}
          {userInfo?.role === "advisor" && (
            <Link
              to="/advisor/events" 
              className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center"
            >
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-gray-900">View Approved Events</h3>
              <p className="mt-2 text-sm text-gray-500">Access all approved event proposals</p>
            </Link>
          )}

          {/* Calendar Card */}
          <div className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Event Calendar</h3>
            <p className="mt-2 text-sm text-gray-500">
              View upcoming events and schedules
            </p>
          </div>

          {/* Settings Card */}
          <div className="group relative bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 flex flex-col items-center justify-center text-center">
            <Settings className="h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Settings</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage your account settings
            </p>
          </div>
        </div>

        <div className="mt-8">
          <NotificationPanel userRole={userInfo?.role} />
        </div>

        {/* Role Badge */}
        <div className="mt-8 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
          {userInfo?.role.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;