import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/NotificationAPI";
import { UserContext } from "../contexts/UserContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [processingMarkAll, setProcessingMarkAll] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Load notifications and unread count
  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, countRes] = await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);

      // If backend indicates unauthorized, redirect to login
      if (notifRes?.status === false && notifRes?.code === 401) {
        navigate("/login");
        return;
      }

      if (notifRes?.status) setNotifications(notifRes.data || []);
      if (countRes?.status) setUnreadCount(countRes.data?.unread ?? 0);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const res = await markNotificationAsRead(id);
      if (res?.status) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
        );
        setUnreadCount((c) => Math.max(c - 1, 0));
      } else {
        console.warn("Failed to mark notification as read:", res?.message);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    setProcessingMarkAll(true);
    try {
      const res = await markAllNotificationsAsRead();
      if (res?.status) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      } else {
        console.warn("Failed to mark all as read:", res?.message);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setProcessingMarkAll(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
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
              disabled={processingMarkAll}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {processingMarkAll ? "Processing..." : "Mark all as read"}
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
