import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getBooking, deleteBooking, updateBooking } from "../api/BookingAPI";

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const bookingId = searchParams.get("id");

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = () => {
      getBooking(bookingId).then((res) => {
        if (res.status) {
          setBooking(res.data);
          setFormData(res.data);
        } else {
          alert(res.message || "Failed to load booking.");
        }
      });
    };

    fetchBooking();
  }, [bookingId]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    const res = await deleteBooking(bookingId);
    if (res.status) {
      alert("Booking deleted.");
      navigate("/my-bookings");
    } else {
      alert(res.message || "Failed to delete booking.");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const res = await updateBooking(bookingId, formData);
    if (res.status) {
      alert("Booking updated.");
      setEditing(false);
      // Refresh booking data after update
      getBooking(bookingId).then((res) => {
        if (res.status) {
          setBooking(res.data);
          setFormData(res.data);
        }
      });
    } else {
      alert(res.message || "Failed to update booking.");
    }
  };

  if (!booking) return <div className="p-4">Loading booking details...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>

      {editing ? (
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Pickup Address:</label>
            <input
              type="text"
              value={formData.pickup_address || ""}
              onChange={(e) =>
                setFormData({ ...formData, pickup_address: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Drop Address:</label>
            <input
              type="text"
              value={formData.drop_address || ""}
              onChange={(e) =>
                setFormData({ ...formData, drop_address: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Scheduled Time:</label>
            <input
              type="datetime-local"
              value={formData.scheduled_time?.slice(0, 16) || ""}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_time: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2 text-gray-800">
          <p>
            <strong>From:</strong> {booking.pickup_address}
          </p>
          <p>
            <strong>To:</strong> {booking.drop_address}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(booking.scheduled_time).toLocaleString("en-BD")}
          </p>
          <p>
            <strong>Status:</strong> {booking.status}
          </p>
          <p>
            <strong>Distance:</strong> {booking.distance_km || "N/A"} km
          </p>
          <p>
            <strong>Price:</strong>{" "}
            {booking.price ? `৳${booking.price}` : "Pending"}
          </p>

          {/* Confirmed offer info */}
          {booking.status === "confirmed" && booking.confirmed_offer ? (
            <div className="border p-3 mt-3 rounded bg-green-50 text-green-800">
              <h4 className="font-semibold mb-1">Confirmed Offer</h4>
              <p>
                <strong>Driver:</strong> {booking.confirmed_offer.driver_name}
              </p>
              <p>
                <strong>Price:</strong> ৳{booking.confirmed_offer.price}
              </p>
              <p>
                <strong>Message:</strong> {booking.confirmed_offer.message}
              </p>
            </div>
          ) : booking.status === "pending" ? (
            <div className="mt-4">
              <button
                onClick={() => navigate(`/offers/${booking.id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                View Driver Offers
              </button>
            </div>
          ) : null}

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
