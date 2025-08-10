import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { createBooking } from "../api/BookingAPI";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingForm() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pickup_address: "",
    drop_address: "",
    scheduled_time: "",
    vehicle_type: "truck",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent selecting past dates by aligning to local timezone
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; // offset in ms
  const localISO = new Date(now - tzOffset).toISOString().slice(0, 16);
  const minDateTime = localISO;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user) {
      alert("You must be logged in to book.");
      setLoading(false);
      return;
    }

    const bookingPayload = {
      ...formData,
      user_id: user.user_id,
    };

    try {
      const res = await createBooking(bookingPayload);
      if (res.status) {
        navigate("/my-bookings");
      } else {
        setError(res.message || "Booking failed");
      }
    } catch {
      setError("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  // Block access for admin or driver roles
  if (user?.role === "admin" || user?.role === "driver") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto px-4 py-6 bg-red-100 border border-red-400 text-red-700 rounded text-center"
      >
        You can't access this page.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 py-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Request a Booking</h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="text-red-600 mb-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="pickup_address"
          placeholder="Pickup Address"
          value={formData.pickup_address}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="drop_address"
          placeholder="Drop Address"
          value={formData.drop_address}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="datetime-local"
          name="scheduled_time"
          value={formData.scheduled_time}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
          min={minDateTime}
        />

        <select
          name="vehicle_type"
          value={formData.vehicle_type}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="truck">Truck</option>
          <option value="pickup">Pickup</option>
          <option value="van">Van</option>
        </select>

        <textarea
          name="notes"
          placeholder="Any extra notes (optional)"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Request Booking"}
        </button>
      </form>
    </motion.div>
  );
}
