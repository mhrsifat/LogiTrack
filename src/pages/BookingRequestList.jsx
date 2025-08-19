import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { useUser } from "../contexts/UserContext";

const BookingRequestList = () => {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  const isDriver = user?.role === "driver";

  useEffect(() => {
    const fetchRequests = async () => {
      setError(null); // clear previous error
      setLoading(true);

      try {
        const res = await fetch(`${BASE_URL}/bookings`, {
          credentials: "include",
        });
        const result = await res.json();

        if (result.status && Array.isArray(result.data)) {
          setRequests(result.data);
        } else {
          throw new Error(result.message || "Invalid data format.");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleSendOffer = async () => {
    // Validate price
    if (!offerPrice || Number(offerPrice) <= 0) {
      alert("Please enter a valid offered price.");
      return;
    }

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

      const result = await response.json();
      if (result.status) {
        alert("Offer sent successfully!");
        setSelectedBooking(null);
        setOfferPrice("");
        setOfferMessage("");
      } else {
        alert("Failed to send offer: " + result.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Error sending offer.");
    }
  };

  if (loading) return <div>Loading booking requests...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Booking Requests</h1>

      {requests.length === 0 ? (
        <p>No booking requests found.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="border p-3 rounded shadow mb-3">
            <p><strong>Pickup:</strong> {request.pickup_address}</p>
            <p><strong>Drop:</strong> {request.drop_address}</p>
            <p><strong>Scheduled:</strong> {new Date(request.scheduled_time).toLocaleString()}</p>
            <p><strong>Vehicle:</strong> {request.vehicle_type}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <small><p><strong>created at:</strong> {new Date(request.created_at).toLocaleString()}</p></small>

            {isDriver && (
              <button
                onClick={() => {
                  setSelectedBooking(request);
                  setOfferPrice("");
                  setOfferMessage("");
                }}
                className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Make Offer
              </button>
            )}
          </div>
        ))
      )}

      {/* Offer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow">
            <h2 className="text-lg font-bold mb-4">
              Send Offer for Booking #{selectedBooking.id}
            </h2>

            <div className="mb-2">
              <label className="block font-medium">Offered Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <div className="mb-2">
              <label className="block font-medium">Message (optional)</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="border p-2 w-full rounded"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-gray-400 px-4 py-1 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={!offerPrice || Number(offerPrice) <= 0}
                className={`px-4 py-1 rounded text-white ${
                  !offerPrice || Number(offerPrice) <= 0
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Send Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingRequestList;
