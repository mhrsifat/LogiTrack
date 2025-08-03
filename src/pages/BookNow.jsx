import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { createBooking } from "../api/BookingAPI";

const BookingForm = () => {
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
      return;
    }

    const bookingPayload = {
      ...formData,
      user_id: user.user_id,
    };

    const res = await createBooking(bookingPayload);
    if (res.status) {
      navigate("/my-bookings");
    } else {
      setError(res.message || "Booking failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Request a Booking</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}

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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Request Booking"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
