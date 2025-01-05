import { useState } from 'react';
import axios from 'axios';
import { DollarSign, AlertCircle } from 'lucide-react';

const SponsorForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    sponsorName: '',
    amount: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5001/api/users/sponsors/create', {
        eventProposalId: event._id,
        sponsorName: formData.sponsorName,
        amount: parseFloat(formData.amount),
        submittedBy: localStorage.getItem('userId')
      });

      if (response.data.success) {
        onSubmit(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit sponsor request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Add Sponsor</h3>
      
      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sponsor Name
          </label>
          <input
            type="text"
            value={formData.sponsorName}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              sponsorName: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (BDT)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                amount: e.target.value
              }))}
              className="w-full pl-10 pr-3 py-2 border rounded-md"
              min="0"
              max={event.sponsorRequirement}
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Remaining requirement: {event.sponsorRequirement} BDT
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {event.sponsors?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Sponsors</h4>
          {event.sponsors.map((sponsor, index) => (
            <div key={index} className="mt-2 p-3 bg-gray-50 rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{sponsor.sponsorName}</p>
                  <p className="text-sm text-gray-500">Amount: {sponsor.amount} BDT</p>
                </div>
                <span className={`text-sm font-medium ${
                  sponsor.status === 'approved' ? 'text-green-500' :
                  sponsor.status === 'rejected' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {sponsor.status}
                </span>
              </div>
              {sponsor.reviewComment && (
                <p className="mt-2 text-sm text-gray-600">
                  Comment: {sponsor.reviewComment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorForm;