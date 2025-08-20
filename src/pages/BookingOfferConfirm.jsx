import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";
import HowToPay from "../components/HowToPay";
import { BASE_URL } from "../config";

const BookingOfferConfirm = ({ bookingId: propBookingId }) => {
  const { offerId } = useParams();
  const location = useLocation();
  const linkState = location.state || {};

  const offerFromState = linkState.offer || null;
  const stateBookingId = linkState.bookingId ? Number(linkState.bookingId) : null;
  const stateOfferedPrice = linkState.offeredPrice ? Number(linkState.offeredPrice) : null;

  // effective data source (state first, else we may fetch)
  const [offer, setOffer] = useState(offerFromState);
  const [fetchingOffer, setFetchingOffer] = useState(false);

  // compute offeredPrice (prefer state -> fetched offer -> null)
  const offeredPrice = useMemo(() => {
    if (stateOfferedPrice) return stateOfferedPrice;
    if (offer && offer.offered_price) return Number(offer.offered_price);
    return null;
  }, [stateOfferedPrice, offer]);

  // commission and suggestedTotal (10%)
  const commission = offeredPrice ? +(offeredPrice * 0.10) : 0;
  const suggestedTotal = offeredPrice ? +(offeredPrice + commission) : 0;

  // effective booking id: prop -> state -> offer
  const effectiveBookingId = useMemo(() => {
    if (propBookingId) return Number(propBookingId);
    if (stateBookingId) return stateBookingId;
    if (offer && offer.booking_id) return Number(offer.booking_id);
    return null;
  }, [propBookingId, stateBookingId, offer]);

  const [paymentNumber, setPaymentNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState(offeredPrice ? String(suggestedTotal.toFixed(2)) : "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // if no offer in state, try fetch the offer by offerId to get booking_id and offered_price
  useEffect(() => {
    const loadOffer = async () => {
      if (offer || !offerId) return;
      setFetchingOffer(true);
      try {
        const res = await fetch(`${BASE_URL}/offers/${offerId}`, { credentials: "include" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.message || "Failed to load offer");
        setOffer(payload.data); // expect single offer object in data
      } catch (err) {
        console.error("Could not fetch offer:", err);
      } finally {
        setFetchingOffer(false);
      }
    };
    loadOffer();
    // eslint-disable-next-line
  }, [offerId]);

  // when offeredPrice becomes available, update amount default (but don't overwrite user edits)
  useEffect(() => {
    if (offeredPrice && (!amount || amount.trim() === "")) {
      setAmount(String(suggestedTotal.toFixed(2)));
    }
    // eslint-disable-next-line
  }, [offeredPrice]);

  const fmt = (v) => {
    const n = Number(v);
    return isNaN(n) ? v : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePaymentSubmit = async () => {
    if (!effectiveBookingId) {
      setMessage("Booking ID missing. Cannot submit payment.");
      return;
    }
    if (!paymentNumber || !transactionId || !amount) {
      setMessage("All fields are required!");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }

    const paymentData = {
      booking_id: effectiveBookingId,
      amount: numericAmount,
      selected_offer_id: offerId,
      method: "bkash",
      transaction_id: transactionId,
      paid_at: new Date().toISOString(),
    };

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(BASE_URL + "/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
        credentials: "include",
      });

      let result = null;
      // eslint-disable-next-line no-unused-vars
      try { result = await response.json(); } catch (e) { /* ignore */ }

      if (response.ok) {
        setMessage(result?.message || "✅ Payment recorded successfully");
        setPaymentNumber("");
        setTransactionId("");
        setAmount("");
      } else {
        setMessage(result?.message || `❌ Payment failed (status ${response.status})`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("⚠️ Network error or server not responding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="max-w-6xl mx-auto mt-10 px-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: Payment form */}
        <motion.div className="bg-white p-6 rounded-2xl shadow-lg" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Confirm Booking Offer</h2>

          {fetchingOffer && <div className="text-sm text-blue-600 mb-3">Loading offer details...</div>}

          <div className="space-y-4">
            <div className="rounded-lg border p-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-500">Offered Price</div>
                  <div className="text-lg font-semibold">৳ {fmt(offeredPrice ?? 0)}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Commission (10%)</div>
                  <div className="text-lg font-semibold">৳ {fmt(commission)}</div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Total</div>
                  <div className="text-2xl font-bold text-pink-600">৳ {fmt(suggestedTotal)}</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Bkash Number</label>
              <input type="text" value={paymentNumber} onChange={(e) => setPaymentNumber(e.target.value)} placeholder="01XXXXXXXXX" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Transaction ID</label>
              <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="TX12345678" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Amount</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:outline-none" />
              <p className="text-xs text-gray-500 mt-1">Suggested: ৳ {fmt(suggestedTotal)} (Offered + 10% commission)</p>
            </div>

            <motion.button onClick={handlePaymentSubmit} disabled={loading || fetchingOffer} className="w-full mt-2 bg-pink-600 text-white py-2 rounded-lg shadow font-semibold disabled:opacity-60" whileTap={{ scale: 0.97 }}>
              {loading ? "Submitting..." : "Submit Payment"}
            </motion.button>

            {message && <motion.p className="mt-3 text-center font-medium text-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{message}</motion.p>}
          </div>
        </motion.div>

        {/* RIGHT: HowToPay */}
        <motion.div className="bg-gray-50 p-6 rounded-2xl shadow-inner border border-gray-100" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <HowToPay />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookingOfferConfirm;
