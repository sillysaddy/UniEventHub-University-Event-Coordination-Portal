import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  IdCard
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userId: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Add validation before submitting
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Submitting registration:", formData); // Log the submission
      const response = await axios.post("http://localhost:5001/api/users/register", formData);
      console.log("Registration response:", response.data); // Log the response
      
      if (response.data.success) {
        alert("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Registration error:", err.response || err); // Log the error
      setError(err.response?.data?.message || "Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/10 rounded-full mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Register to start managing university events
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-lg">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              {/* User ID Field */}
              <div className="space-y-2">
                <label htmlFor="userId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  User ID
                </label>
                <input
                  id="userId"
                  name="userId"
                  type="text"
                  required
                  value={formData.userId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Enter your user ID"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Create a password"
                />
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/90">
                Sign in instead
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
