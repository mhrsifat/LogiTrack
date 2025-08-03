import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";

const BookingHistoryDriver = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For re-offer modal:
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const response = await fetch(`${BASE_URL}/bookings-history-driver`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch booking history.");
        }

        const data = await response.json();

        if (data.status && Array.isArray(data.data)) {
          setBookings(data.data);
        } else {
          throw new Error("Invalid response format.");
        }
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverBookings();
  }, []);

  const handleSendReoffer = async () => {
    if (!offerPrice) {
      alert("Please enter an offer price.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/booking-offers-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          booking_id: selectedBooking?.id,
          proposed_price: Number(offerPrice),
          message: offerMessage,
        }),
      });

      const data = await response.json();
      if (response.ok && data.status) {
        alert("Offer sent successfully!");
        setSelectedBooking(null);
        setOfferPrice("");
        setOfferMessage("");
      } else {
        alert("Failed to send offer: " + (data.message || "Unknown error"));
      }
    } catch {
      alert("Error sending offer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading your booking history...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!bookings.length) return <div>No booking history found.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Booking History</h1>
      <ul className="space-y-4">
        {bookings.map((booking) => (
          <li
            key={booking.id}
            className="border rounded p-4 shadow hover:shadow-lg transition"
          >
            <p>
              <strong>Pickup Address:</strong> {booking.pickup_address}
            </p>
            <p>
              <strong>Drop Address:</strong> {booking.drop_address}
            </p>
            <p>
              <strong>Scheduled Time:</strong>{" "}
              {new Date(booking.scheduled_time).toLocaleString()}
            </p>
            <p>
              <strong>Vehicle Type:</strong> {booking.vehicle_type || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {booking.status}
            </p>
            <p>
              <strong>Offer Price:</strong> {booking.offered_price}
            </p>
            	

            <button
              className="mt-3 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setSelectedBooking(booking)}
            >
              Re-Offer
            </button>
          </li>
        ))}
      </ul>

      {/* Re-Offer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow">
            <h2 className="text-lg font-bold mb-4">
              Send New Offer for Booking #{selectedBooking.id}
            </h2>

            <label className="block mb-2 font-medium">Offer Price</label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="border p-2 w-full rounded mb-4"
              min="0"
            />

            <label className="block mb-2 font-medium">Message (optional)</label>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="border p-2 w-full rounded mb-4"
              rows={3}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => setSelectedBooking(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleSendReoffer}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryDriver;
