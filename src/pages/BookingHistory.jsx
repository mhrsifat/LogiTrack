import React, { useEffect, useState, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "../contexts/UserContext";
import { getAllBookings, deleteBooking } from "../api/BookingAPI";
import { BASE_URL } from "../config";

const listVariants = { hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString("en-BD") : "N/A");
const formatCurrency = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "N/A";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const BookingHistory = () => {
  const { user } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpOpenFor, setOtpOpenFor] = useState(null);
  const [otpValueByBooking, setOtpValueByBooking] = useState({});
  const [globalError, setGlobalError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const signal = controller.signal;

    const loadBookings = async () => {
      setLoading(true);
      setGlobalError(null);
      try {
        const res = await getAllBookings();
        if (!res.status) {
          setGlobalError(res.message || "Failed to load bookings.");
          setBookings([]);
          setLoading(false);
          return;
        }

        const userBookings = res.data.filter((b) => b.user_id === user.user_id);
        const enriched = await Promise.all(
          userBookings.map(async (b) => {
            if (signal.aborted) return { ...b, payment_status: null };
            try {
              const payRes = await fetch(`${BASE_URL}/payments/${b.id}`, { credentials: "include", signal });
              const payPayload = await payRes.json().catch(() => ({}));
              let paymentRow = null;
              if (Array.isArray(payPayload.data) && payPayload.data.length > 0) paymentRow = payPayload.data[0];
              else if (payPayload.data && typeof payPayload.data === "object") paymentRow = payPayload.data;

              if (paymentRow) return { ...b, payment_status: paymentRow.status ?? null };
            } catch (err) {
              if (err.name !== "AbortError") console.warn("Payment fetch failed", b.id, err);
            }
            return { ...b, payment_status: null };
          })
        );

        if (!signal.aborted) setBookings(enriched);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setGlobalError("Error fetching bookings.");
          setBookings([]);
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    };

    loadBookings();
    return () => controller.abort();
  }, [user]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this booking?")) return;
      try {
        const res = await deleteBooking(id);
        if (res.status) setBookings((prev) => prev.filter((b) => b.id !== id));
        else alert(res.message || "Failed to delete booking.");
      } catch (err) {
        console.error(err);
        alert("Failed to delete booking.");
      }
    },
    []
  );

  const handleReceiveOtp = useCallback((booking) => {
    if (!booking.selected_offer_id) return alert("No selected offer for this booking.");
    if (booking.payment_status !== "paid") return alert("Payment not confirmed yet.");
    setOtpOpenFor(booking.id);
  }, []);

  const handleSubmitOtp = useCallback(
    async (bookingId) => {
      const otp = otpValueByBooking[bookingId];
      if (!otp) return alert("Enter OTP");

      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      try {
        const res = await fetch(`${BASE_URL}/bookings/${bookingId}/verify-otp`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp, offer_id: booking.selected_offer_id }),
        });
        const data = await res.json();
        if (res.ok && data.status) {
          setBookings((prev) =>
            prev.map((b) => (b.id === bookingId ? { ...b, status: "completed" } : b))
          );
          setOtpOpenFor(null);
        } else alert(data.message || "OTP verification failed");
      } catch (err) {
        console.error(err);
        alert("Network error while verifying OTP");
      }
    },
    [bookings, otpValueByBooking]
  );

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        <div className="space-y-3">
          <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse" />
          <div className="h-40 bg-white rounded shadow p-4 animate-pulse" />
        </div>
      </div>
    );

  if (globalError)
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
        <div className="text-red-600">{globalError}</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600">You have no bookings yet.</p>
      ) : (
        <motion.ul initial="hidden" animate="visible" variants={listVariants} className="space-y-4">
          {bookings.map((b) => {
            const isPending = b.status === "pending";
            const canReceiveOtp = !!b.selected_offer_id && b.payment_status === "paid";
            const otpOpen = otpOpenFor === b.id;
            const isCompletedOrConfirmed = b.status === "completed" || b.status === "confirmed";

            return (
              <motion.li key={b.id} variants={itemVariants} className="border p-4 rounded shadow hover:shadow-md transition bg-white">
                <div className="md:flex md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600"><strong>From:</strong> {b.pickup_address}</p>
                    <p className="text-sm text-gray-600"><strong>To:</strong> {b.drop_address}</p>
                    <p className="text-sm text-gray-600"><strong>Scheduled:</strong> {formatDate(b.scheduled_time)}</p>
                    <p className="text-sm text-gray-600"><strong>Vehicle:</strong> {b.vehicle_type || "N/A"}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong>{" "}
                      <motion.span layout className={`inline-block px-2 py-1 text-xs rounded-full ${isCompletedOrConfirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {b.status}
                      </motion.span>
                    </p>
                  </div>

                  <div className="mt-3 md:mt-0 md:text-right">
                    <p className="text-sm text-gray-700"><strong>Price:</strong> {b.price ? `৳ ${formatCurrency(b.price)}` : "Pending"}</p>
                    <p className="text-sm text-gray-500"><strong>Payment:</strong> {b.payment_status ?? "No payment yet"}</p>
                    <p className="text-sm text-gray-500"><strong>Created:</strong> {formatDate(b.created_at)}</p>

                    {!isCompletedOrConfirmed && (
                      <motion.div layout className="flex flex-wrap justify-end gap-2 mt-3">
                        <Link to={`/booking-details?id=${b.id}`} className="text-blue-600 hover:underline">View</Link>
                        {isPending && <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/offers/${b.id}`)} className="text-green-600 hover:underline">View Offers</motion.button>}
                        {!otpOpen && <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline">Delete</motion.button>}
                        {canReceiveOtp && !otpOpen && (
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleReceiveOtp(b)} className="inline-flex items-center gap-2 px-3 py-1 rounded text-white bg-indigo-600 hover:bg-indigo-700">
                            Receive OTP
                          </motion.button>
                        )}
                        {isPending && !canReceiveOtp && !otpOpen && (
                          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                            Waiting for payment confirmation {b.payment_status ? `(${b.payment_status})` : ""}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {otpOpen && (
                      <motion.div layout className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={otpValueByBooking[b.id] || ""}
                          onChange={(e) => setOtpValueByBooking((m) => ({ ...m, [b.id]: e.target.value }))}
                          placeholder="Enter OTP"
                          className="border p-1 rounded"
                        />
                        <button onClick={() => handleSubmitOtp(b.id)} className="bg-green-600 text-white px-3 py-1 rounded">Submit OTP</button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </div>
  );
};

export default BookingHistory;
