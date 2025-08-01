import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import Error from "../components/Error";
import { CheckCheck, Bell, Clock } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/notifications`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.status) {
          setNotifications(data.data);
        } else {
          setError(data.message || "No notifications found.");
        }
      } catch (err) {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      setNotifications((prev) =>
        prev.map((note) =>
          note.id === id ? { ...note, is_read: 1 } : note
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2">
        <Bell size={22} /> Notifications
      </h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((note) => (
            <li
              key={note.id}
              className={`p-4 border rounded-lg shadow-sm ${
                note.is_read ? "bg-gray-100" : "bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {note.title}
                  </h3>
                  <p className="text-gray-600">{note.message}</p>
                  <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={14} />{" "}
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                {!note.is_read && (
                  <button
                    onClick={() => markAsRead(note.id)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Mark as Read
                  </button>
                )}
                {note.is_read && (
                  <CheckCheck className="text-green-500 mt-1" size={20} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;