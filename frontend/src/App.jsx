import { Route, Routes, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProposal from "./pages/CreateProposal";
import MyEvents from "./pages/MyEvents";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import ProtectedRoute from "./components/ProtectedRoute"; // Add this import

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["club_representative", "oca_staff", "advisor"]}>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={["club_representative", "oca_staff", "advisor"]}>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={["system_admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-proposal" 
        element={
          <ProtectedRoute allowedRoles={["club_representative"]}>
            <CreateProposal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-events" 
        element={
          <ProtectedRoute allowedRoles={["club_representative", "oca_staff"]}>
            <MyEvents />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/edit-proposal/:id" 
        element={
          <ProtectedRoute allowedRoles={["club_representative"]}>
            <CreateProposal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/advisor/events" 
        element={
          <ProtectedRoute allowedRoles={["advisor"]}>
            <AdvisorDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
