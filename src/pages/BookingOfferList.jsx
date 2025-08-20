import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../config";

const BookingOfferList = () => {
  const { id: bookingId } = useParams();
  const [offers, setOffers] = useState([]);
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch booking details
        const bookingRes = await fetch(`${BASE_URL}/bookings/${bookingId}`, { credentials: "include" });
        const bookingData = await bookingRes.json();
        if (bookingRes.ok && bookingData.data) setBooking(bookingData.data);

        // Fetch offers
        const offerRes = await fetch(`${BASE_URL}/booking-offers/${bookingId}`, { credentials: "include" });
        const offerData = await offerRes.json();
        if (offerRes.ok) setOffers(Array.isArray(offerData.data) ? offerData.data : []);

        // Fetch payment
        const paymentRes = await fetch(`${BASE_URL}/payments/${bookingId}`, { credentials: "include" });
        const paymentData = await paymentRes.json();
        if (paymentRes.ok && paymentData.data) setPayment(paymentData.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const fmt = (v) => {
    const n = Number(v);
    return isNaN(n) ? v : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (loading) return <div className="p-4 text-blue-600">Loading booking offers...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      {/* Booking Header */}
      <h2 className="text-2xl font-semibold mb-4">
        Offers for Booking {booking ? `${booking.pickup_address} → ${booking.drop_address}` : `#${bookingId}`}
      </h2>

      {/* Payment Warning */}
      {payment && payment.status === "pending" && (
        <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          You have already requested payment. Please wait for confirmation.
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="p-4 text-gray-600">No offers available for this booking.</div>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => {
            const offered = Number(offer.offered_price ?? 0);
            const commission = offered * 0.10;
            const total = offered + commission;

            return (
              <motion.div
                key={offer.id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white"
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600">Driver</p>
                    <p className="text-lg font-medium">{offer.driver_name || `Driver #${offer.driver_id}`}</p>
                    <p className="mt-2 text-sm"><strong>Message:</strong> {offer.message || "—"}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      <strong>Phone:</strong> {offer.phone || "—"} • <strong>Email:</strong> {offer.email || "—"}
                    </p>
                    <p className="mt-2 text-sm text-gray-600"><strong>Offered at:</strong> {offer.created_at}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">Offered Price</div>
                    <div className="text-2xl font-bold text-gray-800">৳ {fmt(offered)}</div>

                    <div className="mt-2 text-sm text-gray-500">+ Commission (10%)</div>
                    <div className="text-lg font-medium text-gray-700">৳ {fmt(commission)}</div>

                    <div className="mt-3 text-xs text-gray-500">Total (you pay)</div>
                    <div className="text-xl font-semibold text-pink-600">৳ {fmt(total)}</div>

                    {/* Show button based on offer status */}
                    <div className="mt-3">
                      {offer.status === "accepted" ? (
                        <Link
                          to={`/destination-reached/${offer.id}`}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Destination Reached / Enter OTP
                        </Link>
                      ) : (!payment || payment.status !== "pending") ? (
                        <Link
                          to={`/confirm-offer/${offer.id}`}
                          state={{ bookingId: offer.booking_id, offeredPrice: offer.offered_price, offer }}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Confirm This Offer
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingOfferList;
