import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { getAllBookings, deleteBooking } from "../api/BookingAPI";

const BookingHistory = () => {
  const { user } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getAllBookings().then((res) => {
      if (res.status) {
        const userBookings = res.data.filter(
          (booking) => booking.user_id === user.user_id
        );
        setBookings(userBookings);
      }
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    const res = await deleteBooking(id);
    if (res.status) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert(res.message || "Failed to delete booking.");
    }
  };

  if (loading) return <div className="p-4">Loading your bookings...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="border p-4 rounded shadow hover:shadow-md transition"
            >
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
                <strong>Distance:</strong> {booking.distance_km} km
              </p>
              <p>
                <strong>Price:</strong> ৳{booking.price}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : booking.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {booking.status}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                <strong>Created:</strong>{" "}
                {new Date(booking.created_at).toLocaleString("en-BD")}
              </p>

              <div className="flex gap-4 mt-3">
                <Link
                  to={`/booking-details?id=${booking.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;
