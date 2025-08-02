import React, { useEffect, useState, useRef } from "react";
import { BASE_URL } from "../config";
import ErrorBox from "../components/ErrorBox";
import Successfull from "../components/Successfull";

const BookNow = () => {
  const [gigs, setGigs] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedGig, setSelectedGig] = useState(null);
  const modalRef = useRef();

  const [form, setForm] = useState({
    pickup_address: "",
    drop_address: "",
    scheduled_time: "",
    distance_km: "",
    price: "",
  });

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/gigs`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load gigs");
        if (Array.isArray(data.data)) {
          setGigs(data.data);
        } else {
          throw new Error("Invalid data format: gigs not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGigs();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        selectedGig &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setSelectedGig(null);
      }
    }

    function handleEscapeKey(event) {
      if (event.key === "Escape") {
        setSelectedGig(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [selectedGig]);

  const handleOpenModal = (gig) => {
    setSelectedGig(gig);
    setForm({
      pickup_address: gig.pickup_location,
      drop_address: gig.dropoff_location,
      scheduled_time: new Date(gig.available_from)
        .toISOString()
        .slice(0, 16),
      distance_km: "",
      price: gig.price,
    });
  };

  const handleBooking = async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vehicle_id: selectedGig.vehicle_id,
          pickup_address: form.pickup_address,
          drop_address: form.drop_address,
          status: "pending",
          scheduled_time: form.scheduled_time,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setSuccess("Booking successful!");
      setSelectedGig(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Available Gigs</h2>

      {error && <ErrorBox msg={error} />}
      {success && <Successfull msg={success} />}

      {loading ? (
        <p className="text-gray-500">Loading gigs...</p>
      ) : gigs.length > 0 ? (
        <div className="space-y-4">
          {gigs.map((gig) => (
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
                onClick={() => handleOpenModal(gig)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Book
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No gigs found.</p>
      )}

      {/* MODAL */}
      {selectedGig && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>

            <label className="block mb-3">
              Pickup Address
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={form.pickup_address}
                onChange={(e) =>
                  setForm({ ...form, pickup_address: e.target.value })
                }
              />
            </label>

            <label className="block mb-3">
              Drop Address
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={form.drop_address}
                onChange={(e) =>
                  setForm({ ...form, drop_address: e.target.value })
                }
              />
            </label>

            <label className="block mb-3">
              Schedule Time
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={form.scheduled_time}
                onChange={(e) =>
                  setForm({ ...form, scheduled_time: e.target.value })
                }
              />
            </label>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setSelectedGig(null)}
                className="px-4 py-2 rounded border border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookNow;