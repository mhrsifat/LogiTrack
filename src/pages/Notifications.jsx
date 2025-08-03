import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: 1 } : n
          )
        );
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Notifications</h2>

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
                <p className="text-sm text-gray-800">{notif.message}</p>
                {!notif.is_read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
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

