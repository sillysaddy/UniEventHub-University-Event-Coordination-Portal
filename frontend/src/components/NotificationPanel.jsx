import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, X } from 'lucide-react';

const NotificationPanel = ({ userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'announcement'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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

  const canCreateNotifications = ['oca_staff', 'club_representative'].includes(userRole);

  return (
    <div className="relative">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </h2>
          {canCreateNotifications && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-primary hover:text-primary/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create Notification</h3>
                <button onClick={() => setShowCreateForm(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      message: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="alert">Alert</option>
                    <option value="update">Update</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Create Notification
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{notification.title}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{notification.message}</p>
              <div className="mt-2 text-xs text-gray-500">
                By: {notification.createdBy.name} ({notification.createdBy.role})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;