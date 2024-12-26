import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { 
  Calendar, 
  Loader2, 
  BanknoteIcon, // Changed from BangBanknote
  Users, 
  FileText,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { cn } from "@/utils/utils";

const CreateProposal = () => {
  const { id } = useParams(); // Get proposal ID if editing
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    clubName: "",
    startDate: "",
    endDate: "",
    documents: null
  });

  // Fetch proposal data if editing
  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return; // Skip if creating new proposal

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/users/proposals/${id}`);
        const proposal = response.data.data;

        // Format dates for input fields
        const formatDate = (date) => new Date(date).toISOString().split('T')[0];

        setFormData({
          title: proposal.title,
          description: proposal.description,
          budget: proposal.budget,
          clubName: proposal.clubName,
          startDate: formatDate(proposal.startDate),
          endDate: formatDate(proposal.endDate),
          documents: null // Reset documents as we can't pre-fill file inputs
        });
      } catch (err) {
        setError("Failed to fetch proposal details");
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should be less than 5MB");
        return;
      }
      setFormData(prev => ({
        ...prev,
        documents: file
      }));
    }
  };

  const validateDates = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Start date cannot be in the past");
      return false;
    }
    if (end < start) {
      setError("End date must be after start date");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.description?.trim()) {
      setError("Description is required");
      return false;
    }
    if (!formData.clubName?.trim()) {
      setError("Club name is required");
      return false;
    }
    if (!formData.budget || isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) < 0) {
      setError("Please enter a valid budget amount");
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setError("Both start and end dates are required");
      return false;
    }
    return validateDates();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Create proposal data
      const proposalData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: parseFloat(formData.budget),
        clubName: formData.clubName.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        submittedBy: userId
      };

      let response;
      if (id) {
        // Update existing proposal
        response = await axios.patch(
          `http://localhost:5001/api/users/proposals/${id}`,
          proposalData
        );
      } else {
        // Create new proposal
        response = await axios.post(
          "http://localhost:5001/api/users/proposals/create",
          proposalData
        );
      }

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/my-events");
        }, 2000);
      }
    } catch (err) {
      console.error("Proposal submission error:", err.response?.data || err);
      setError(err.response?.data?.message || `Failed to ${id ? 'update' : 'submit'} proposal`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Toast */}
        {success && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-top">
            <CheckCircle className="h-5 w-5" />
            <span>Proposal {id ? 'updated' : 'submitted'} successfully!</span>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Edit Event Proposal' : 'Create Event Proposal'}
            </h1>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-500 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Title field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Event Title</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter event title"
              />
            </div>

            {/* Date Selection Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>End Date</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Description field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Describe your event"
              />
            </div>

            {/* Budget field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <BanknoteIcon className="h-4 w-4" />
                <span>Budget (in BDT)</span>
              </label>
              <input
                type="number"
                name="budget"
                required
                min="0"
                value={formData.budget}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter budget amount"
              />
            </div>

            {/* Club Name field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Club Name</span>
              </label>
              <input
                type="text"
                name="clubName"
                required
                value={formData.clubName}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter club name"
              />
            </div>

            {/* Supporting Documents field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Supporting Documents (Optional)</span>
              </label>
              <input
                type="file"
                name="documents"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
              <p className="text-sm text-gray-500">
                Upload PDF or Word documents (max 5MB)
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors",
                  "bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{id ? 'Updating...' : 'Submitting...'}</span>
                  </div>
                ) : (
                  id ? 'Update Proposal' : 'Submit Proposal'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;