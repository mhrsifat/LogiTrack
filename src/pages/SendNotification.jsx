import React, { useState } from "react";
import { sendNotification } from "../api/NotificationAPI";

const SendNotification = () => {
  const [form, setForm] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "push", 
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

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
      setError("All fields are required. সব ফিল্ড পূরণ করুন।");
      return;
    }

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
    } catch (err) {
      setError("Server error. সার্ভারে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Send Notification</h2>

      {success && <p className="text-green-600 mb-2">{success}</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          placeholder="User ID (যাকে পাঠাতে চান)"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title (শিরোনাম)"
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Message (বার্তা)"
          className="w-full border px-3 py-2 rounded"
          rows="4"
          required
        ></textarea>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="push">Push Notification</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send Notification পাঠান
        </button>
      </form>
    </div>
  );
};

export default SendNotification;
