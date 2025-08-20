import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";

const BookingHistoryDriver = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-Offer Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // OTP Modal
  const [otpModalOffer, setOtpModalOffer] = useState(null);
  const [sendingOtpForOfferId, setSendingOtpForOfferId] = useState(null);
  const [otpSentForOffer, setOtpSentForOffer] = useState({});

  useEffect(() => {
    const fetchDriverBookings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bookings-history-driver`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch booking history.");
        const payload = await res.json();
        if (payload.status && Array.isArray(payload.data))
          setBookings(payload.data);
        else throw new Error("Invalid response format.");
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchDriverBookings();
  }, []);

  const openReoffer = (offer) => {
    setSelectedBooking(offer);
    setOfferPrice(offer.offered_price ?? "");
    setOfferMessage(offer.message ?? "");
  };

  const handleSendReoffer = async () => {
    if (!offerPrice) return alert("Please enter an offer price.");
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/booking-offers-driver-update`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: selectedBooking.booking_id,
          proposed_price: Number(offerPrice),
          message: offerMessage,
        }),
      });
      const payload = await res.json();
      if (res.ok && payload.status) {
        alert("Offer sent successfully!");
        setBookings((prev) =>
          prev.map((o) =>
            o.id === selectedBooking.id
              ? { ...o, offered_price: offerPrice, message: offerMessage }
              : o
          )
        );
        setSelectedBooking(null);
        setOfferPrice("");
        setOfferMessage("");
      } else
        alert("Failed to send offer: " + (payload.message || "Unknown error"));
    } catch (err) {
      console.error(err);
      alert("Error sending offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (offer) => {
    setSendingOtpForOfferId(offer.id);
    try {
      const res = await fetch(
        `${BASE_URL}/bookings/${offer.booking_id}/send-otp`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer_id: offer.id }),
        }
      );
      const payload = await res.json();
      if (res.ok && payload.status) {
        setOtpSentForOffer((s) => ({ ...s, [offer.id]: true }));
        return true;
      } else {
        alert(payload.message || `Failed to send OTP (status ${res.status})`);
        return false;
      }
    } catch (err) {
      console.error("send otp error", err);
      alert("Network error while sending OTP.");
      return false;
    } finally {
      setSendingOtpForOfferId(null);
    }
  };

  const handleDestinationButton = async (offer) => {
    if (Number(offer.is_selected) !== 1)
      return alert("Only selected offers can send OTP.");
    if (offer.payment_status !== "paid")
      return alert("Payment must be approved first.");
    if (otpSentForOffer[offer.id]) {
      setOtpModalOffer(offer);
      return;
    }
    const ok = await handleSendOtp(offer);
    if (ok) setOtpModalOffer(offer);
  };

  const fmtPrice = (v) => {
    const n = Number(v);
    return isNaN(n)
      ? v
      : n.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  if (loading)
    return (
      <div className="p-4 text-blue-600">Loading your booking history...</div>
    );
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!bookings.length)
    return <div className="p-4 text-gray-600">No booking history found.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Booking History</h1>
      <ul className="space-y-4">
        {bookings.map((offer) => {
          const bookingCompleted =
            offer.booking_status === "completed" ||
            offer.status === "completed";

          return (
            <li
              key={offer.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-lg">
                  {offer.pickup_address} → {offer.drop_address}
                </h2>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    bookingCompleted
                      ? "bg-gray-200 text-gray-800"
                      : offer.payment_status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {bookingCompleted
                    ? "Completed"
                    : offer.payment_status === "paid"
                    ? "Paid"
                    : "Payment Pending"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <p>
                  <strong>Scheduled:</strong>{" "}
                  {offer.scheduled_time
                    ? new Date(offer.scheduled_time).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Vehicle:</strong> {offer.vehicle_type || "N/A"}
                </p>
                <p>
                  <strong>Booking Status:</strong>{" "}
                  {offer.booking_status || "N/A"}
                </p>
                <p>
                  <strong>Offer Status:</strong> {offer.status || "N/A"}
                </p>
                <p>
                  <strong>Offer Price:</strong>{" "}
                  {offer.offered_price
                    ? `৳ ${fmtPrice(offer.offered_price)}`
                    : "No offer yet"}
                </p>
              </div>

              {offer.message && (
                <div className="bg-gray-50 border-l-4 border-blue-500 p-2 mb-2 text-sm italic text-gray-700">
                  Message: {offer.message}
                </div>
              )}

              {/* Buttons */}
              {!bookingCompleted && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {/* Re-Offer button only for non-selected offers */}
                  {Number(offer.is_selected) === 0 && (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      onClick={() => openReoffer(offer)}
                    >
                      Re-Offer
                    </button>
                  )}

                  {/* Send OTP button only for selected & paid offers */}
                  {Number(offer.is_selected) === 1 &&
                    offer.payment_status === "paid" && (
                      <button
                        className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 transition"
                        onClick={() => handleDestinationButton(offer)}
                        disabled={sendingOtpForOfferId === offer.id}
                      >
                        {sendingOtpForOfferId === offer.id
                          ? "Sending..."
                          : otpSentForOffer[offer.id]
                          ? "An OTP has been sent. Please ask your client to check their messages."
                          : "Destination reached? OTP Sent"}
                      </button>
                    )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Re-Offer Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-md shadow">
            <h2 className="text-lg font-bold mb-4">
              Send New Offer for Booking #{selectedBooking.booking_id}
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

      {/* OTP Modal */}
      {otpModalOffer && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-sm shadow">
            <div className="text-center">
              <p className="text-sm text-gray-700 mb-4">
                OTP has been sent to the user.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setOtpModalOffer(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryDriver;
