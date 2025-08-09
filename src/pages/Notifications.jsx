import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/NotificationAPI";
import { UserContext } from "../contexts/UserContext"; // ✅ Make sure you have this

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(UserContext); // ✅ Access logged-in user
  const navigate = useNavigate();

  // 📦 Notifications এবং Unread Count লোড করে
  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);

      if (notifRes.status === false && notifRes.code === 401) {
        navigate("/login");
        return;
      }

      if (notifRes.status) {
        setNotifications(notifRes.data);
      }

      if (countRes.status) {
        setUnreadCount(countRes.data.unread);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ একক Notification read হিসেবে মার্ক করে
  const handleMarkAsRead = async (id) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res.status) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((c) => Math.max(c - 1, 0));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ✅ সব Notification read হিসেবে মার্ক করে
  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsRead();
      if (res.status) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // ⏲️ ৩০ সেকেন্ড পরপর রিফ্রেশ
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Your Notifications</h2>

        <div className="flex gap-4 items-center">
          {/* ✅ যদি ইউজার অ্যাডমিন হয় */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin/send-notification")}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Send Notification
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`p-4 border rounded-lg shadow-sm transition ${
                notif.is_read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-gray-800">{notif.message}</p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
