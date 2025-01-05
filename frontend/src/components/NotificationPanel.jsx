import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, 
  Plus, 
  X, 
  Megaphone, 
  AlertTriangle, 
  RefreshCw, 
  Info,
  Loader2
} from 'lucide-react';

const NotificationPanel = ({ userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement'
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/users/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      await axios.post('http://localhost:5001/api/users/notifications', {
        ...newNotification,
        userId
      });
      setShowCreateForm(false);
      setNewNotification({ title: '', message: '', type: 'announcement' });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'update':
        return <Info className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const canCreateNotifications = ['oca_staff', 'club_representative'].includes(userRole);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-500">Stay updated with latest announcements</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchNotifications}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5 text-gray-500" />
            </button>
            {canCreateNotifications && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Notification
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{notification.message}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-medium">{notification.createdBy.name}</span>
                      <span>•</span>
                      <span className="capitalize">{notification.createdBy.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Create Notification</h3>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleCreateNotification} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({
                    ...prev,
                    message: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({
                    ...prev,
                    type: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="update">Update</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Create Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;