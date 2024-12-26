import { Route, Routes, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProposal from "./pages/CreateProposal";
import MyEvents from "./pages/MyEvents";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/create-proposal" element={<CreateProposal />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/edit-proposal/:id" element={<CreateProposal />} />
    </Routes>
  );
}

export default App;
