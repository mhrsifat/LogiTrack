import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import Error from "../components/Error";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]); // সব নোটিফিকেশন রাখবে
  const [loading, setLoading] = useState(true); // লোডিং স্টেট
  const [error, setError] = useState(""); // এরর

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/notifications`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.status) {
          setNotifications(data.data); // নোটিফিকেশন সেট
        } else {
          setError(data.message || "No notifications found.");
        }
      } catch (err) {
        setError("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <Error message={error} />;

  if (notifications.length === 0)
    return <p className="text-center text-gray-500">No notifications yet.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 mt-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Notifications</h2>

      <ul className="space-y-4">
        {notifications.map((note) => (
          <li
            key={note.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <h3 className="font-semibold text-lg text-gray-800">
              {note.title}
            </h3>
            <p className="text-gray-600">{note.message}</p>
            <span className="text-xs text-gray-400 block mt-2">
              {new Date(note.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;