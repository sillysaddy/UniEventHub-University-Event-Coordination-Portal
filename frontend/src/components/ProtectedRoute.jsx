import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5001/api/users/profile/${userId}`);
        if (response.data.success) {
          setUserRole(response.data.data.role);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userId = localStorage.getItem("userId");
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;