import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar,
  Filter,
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  ActivitySquare,
  Info,
  Loader2
} from 'lucide-react';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      // Adjust page to be 1-based
      const adjustedPage = Math.max(1, page);
      
      const params = new URLSearchParams({
        page: adjustedPage,
        limit: 10,
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await axios.get(
        `http://localhost:5001/api/users/audit-logs?${params}`
      );

      if (response.data.success) {
        setLogs(response.data.data.logs);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(err.response?.data?.message || "Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      USER_CREATE: 'text-green-600',
      USER_DELETE: 'text-red-600',
      USER_UPDATE: 'text-blue-600',
      ROLE_CHANGE: 'text-purple-600'
      // Add more colors for other actions
    };
    return colors[action] || 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ActivitySquare className="h-5 w-5 text-primary" />
          System Activity Logs
        </h2>
        <span className="text-sm text-gray-500">Total Entries: {logs.length}</span>
      </div>

      {/* Filters Section */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          <span>Filter Logs</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ActivitySquare className="h-4 w-4" />
              Action Type
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">All Actions</option>
              <option value="USER_CREATE">User Creation</option>
              <option value="USER_UPDATE">User Update</option>
              <option value="USER_DELETE">User Deletion</option>
              <option value="ROLE_CHANGE">Role Change</option>
              <option value="PROPOSAL_CREATE">Proposal Creation</option>
              <option value="PROPOSAL_UPDATE">Proposal Update</option>
              <option value="PROPOSAL_REVIEW">Proposal Review</option>
              <option value="SPONSOR_CREATE">Sponsor Addition</option>
              <option value="SPONSOR_REVIEW">Sponsor Review</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 text-red-500">
          {error}
        </div>
      ) : (
        /* Logs Table */
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <ActivitySquare className="h-4 w-4" /> Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Info className="h-4 w-4" /> Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)} bg-opacity-10`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.performedBy?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <pre className="bg-gray-50 p-2 rounded-md whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between border-t pt-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AuditLogViewer;