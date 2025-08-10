import React, { useState, useEffect } from "react";
import { sendNotification, getUsers } from "../api/NotificationAPI";
import { motion, AnimatePresence } from "framer-motion";

const SendNotification = () => {
  const [form, setForm] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "push",
  });

  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getUsers();
      if (res.status) {
        setUsers(res.data);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!form.user_id || !form.title || !form.message || !form.type) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendNotification(form);
      if (res.status) {
        setSuccess("Notification sent successfully.");
        setForm({
          user_id: "",
          title: "",
          message: "",
          type: "push",
        });
      } else {
        setError("Failed to send notification.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded"
    >
      <h2 className="text-2xl font-semibold mb-4">Send Notification</h2>

      <AnimatePresence>
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-green-600 mb-2"
          >
            {success}
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 mb-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
          required
        >
          <option value="">Select a User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} (ID: {user.id})
            </option>
          ))}
        </select>

        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message"
          className="w-full border px-3 py-2 rounded"
          rows="4"
          disabled={loading}
          required
        ></textarea>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          disabled={loading}
          required
        >
          <option value="push">Push Notification</option>
          <option value="email">Email</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>
    </motion.div>
  );
};

export default SendNotification;
