import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BASE_URL } from "../config";

const BookingOfferList = () => {
  const { id: bookingId } = useParams();
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) {
      setError("Missing booking id");
      setLoading(false);
      return;
    }

    const fetchOffers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/booking-offers/${bookingId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch offers");

        setOffers(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setError(err.message);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [bookingId]);

  if (loading) return <div className="p-4 text-blue-600">Loading offers...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (offers.length === 0) return <div className="p-4 text-gray-600">No offers available for this booking.</div>;

  const fmt = (v) => {
    const n = Number(v);
    return isNaN(n) ? v : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Offers for Booking #{bookingId}</h2>
      <div className="grid gap-4">
        {offers.map((offer) => {
          const offered = Number(offer.offered_price ?? 0);
          const commission = +(offered * 0.10);
          const total = +(offered + commission);

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

                  <div className="mt-3">
                    <Link
                      to={`/confirm-offer/${offer.id}`}
                      state={{ bookingId: offer.booking_id, offeredPrice: offer.offered_price, offer }}
                      className="inline-flex items-center gap-2 mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Confirm This Offer
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingOfferList;
