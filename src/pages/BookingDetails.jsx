import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getBooking, deleteBooking, updateBooking } from "../api/BookingAPI";
import { UserContext } from "../contexts/UserContext";

const BookingDetails = () => {
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const bookingId = searchParams.get("id");

  useEffect(() => {
    if (!bookingId) return;

    getBooking(bookingId).then((res) => {
      if (res.status) {
        setBooking(res.data);
        setFormData(res.data); // Pre-fill form with booking data
      } else {
        alert(res.message || "Failed to load booking.");
      }
    });
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
      setBooking(res.data);
      setEditing(false);
      alert("Booking updated successfully.");
      getBooking(bookingId).then((res) => {
        if (res.status) {
          setBooking(res.data);
          setFormData(res.data);
        } else{
            //do nothing, already handled in useEffect
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
              onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Drop Address:</label>
            <input
              type="text"
              value={formData.drop_address || ""}
              onChange={(e) => setFormData({ ...formData, drop_address: e.target.value })}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Scheduled Time:</label>
            <input
              type="datetime-local"
              value={formData.scheduled_time?.slice(0, 16) || ""}
              onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
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
          <p><strong>From:</strong> {booking.pickup_address}</p>
          <p><strong>To:</strong> {booking.drop_address}</p>
          <p><strong>Date:</strong> {new Date(booking.scheduled_time).toLocaleString("en-BD")}</p>
          <p><strong>Distance:</strong> {booking.distance_km} km</p>
          <p><strong>Price:</strong> ৳{booking.price}</p>
          <p><strong>Status:</strong> {booking.status}</p>
          <p className="text-sm text-gray-500"><strong>Created:</strong> {new Date(booking.created_at).toLocaleString("en-BD")}</p>

          <div className="flex gap-4 mt-4">
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
