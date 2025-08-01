import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import Error from "../components/Error";
import Successfull from "../components/Successfull";

const BookingDetails = () => {
  const { id } = useParams(); // URL থেকে id পাওয়া যায়
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null); // বুকিং ডেটা রাখার জন্য
  const [loading, setLoading] = useState(true); // লোডিং কন্ডিশন
  const [error, setError] = useState(""); // এরর মেসেজ

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bookings/${id}`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.status) {
          setBooking(data.data); // API থেকে ডেটা পাওয়া গেছে
        } else {
          setError(data.message || "Booking not found");
        }
      } catch (err) {
        setError("Something went wrong while fetching booking details.");
      } finally {
        setLoading(false); // যাই হোক লোডিং false হবে
      }
    };

    fetchBookingDetails();
  }, [id]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <Error message={error} />;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Booking Details</h2>

      <div className="space-y-3">
        <p>
          <strong>Booking ID:</strong> {booking.id}
        </p>
        <p>
          <strong>Status:</strong> {booking.status}
        </p>
        <p>
          <strong>Pickup Location:</strong> {booking.pickup_location}
        </p>
        <p>
          <strong>Drop Location:</strong> {booking.drop_location}
        </p>
        <p>
          <strong>Vehicle Type:</strong> {booking.vehicle_type}
        </p>
        <p>
          <strong>Schedule Date:</strong> {booking.schedule_date}
        </p>
        <p>
          <strong>Price:</strong> ৳{booking.price}
        </p>
        <p>
          <strong>Created At:</strong> {new Date(booking.created_at).toLocaleString()}
        </p>
      </div>

      <button
        onClick={() => navigate("/my-bookings")}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Back to My Bookings
      </button>
    </div>
  );
};

export default BookingDetails;