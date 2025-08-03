import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BASE_URL } from "../config";

const BookingOfferList = () => {
  const { id: bookingId } = useParams();
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${BASE_URL}/booking-offers/${bookingId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch offers");

        // ✅ Safely handle response
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

  if (offers.length === 0) {
    return <div className="p-4 text-gray-600">No offers available for this booking.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Offers for Booking #{bookingId}</h2>
      <div className="space-y-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <p><strong>Driver ID:</strong> {offer.driver_id}</p>
            <p><strong>Price:</strong> ${offer.price}</p>
            <p><strong>Status:</strong> {offer.status}</p>
            <Link
              to={`/confirm-offer/${offer.id}`}
              className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Confirm This Offer
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingOfferList;
