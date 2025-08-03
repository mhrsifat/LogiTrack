import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { BASE_URL } from "../config";
import Successfull from "../components/Successfull";
import ErrorBox from "../components/ErrorBox";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [vehicleData, setVehicleData] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      if (user.role === "driver") {
        fetchDriverVehicle(user.id);
      }
    }
  }, [user]);

  const fetchDriverVehicle = async () => {
    try {
      const response = await fetch(`${BASE_URL}/vehicles-driver`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();
      if (result.status) {
        setVehicleData(result.data); // ✅ Vehicle exists
      } else {
        setVehicleData(null); // ❌ No vehicle
      }
    } catch (err) {
      console.error("Vehicle fetch failed", err);
      setVehicleData(null);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/update-profile.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status) {
        setSuccess("Profile updated successfully!");
        setUser((prev) => ({ ...prev, ...formData }));
      } else {
        setError(result.message || "Failed to update profile.");
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">My Profile</h2>

      {success && <Successfull msg={success} />}
      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Update Profile
        </button>
      </form>

      {/* 🚚 Vehicle section for drivers only */}
      {user?.role === "driver" && (
        <div className="mt-6 text-center">
          {vehicleData ? (
            <Link
              to="/update-vehicle"
              className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Update Document
            </Link>
          ) : (
            <Link
              to="/submit-vehicle"
              className="inline-block bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600"
            >
              Submit Document
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
