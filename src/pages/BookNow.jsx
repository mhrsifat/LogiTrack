import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { useUser } from "../contexts/UserContext";
import Error from "../components/Error";
import Successfull from "../components/Successfull";

const GigList = () => {
  const { user } = useUser();
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchGigs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/gigs`, {
        credentials: "include",
      });
      const data = await res.json();
      console.log("Fetched data:", data);

      if (!res.ok) throw new Error(data.message || "Failed to load gigs");

      // ✅ Handle array or object response
      if (Array.isArray(data)) {
        setGigs(data);
      } else if (Array.isArray(data.gigs)) {
        setGigs(data.gigs);
      } else {
        throw new Error("Invalid data format: gigs not found");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const handleBooking = async (gigId) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: user?.id, gig_id: gigId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setSuccess("Successfully booked the gig.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Available Gigs</h2>

      {error && <Error message={error} />}
      {success && <Successfull message={success} />}

      <div className="space-y-4">
        {Array.isArray(gigs) && gigs.length > 0 ? (
          gigs.map((gig) => (
            <div
              key={gig.id}
              className="p-4 border rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-bold">From: {gig.pickup_location}</p>
                <p>To: {gig.dropoff_location}</p>
                <p>Vehicle: {gig.vehicle_type}</p>
                <p>Price: {gig.price}৳</p>
                <p>Date: {new Date(gig.available_from).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleBooking(gig.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Book
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No gigs found.</p>
        )}
      </div>
    </div>
  );
};

export default GigList;
