import React, { useEffect, useState } from "react";
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
  const [hasVehicle, setHasVehicle] = useState(null); // null = loading, false = no vehicle, true = has one

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Check if driver already submitted a vehicle
  useEffect(() => {
    if (user?.role !== "driver") {
      setHasVehicle(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/vehicles-exist`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (res.ok && data.status === true) {
          // 200 + status true means no submission yet
          setHasVehicle(false);
        } else if (res.status === 400) {
          // 400 means "already exists"
          setHasVehicle(true);
        } else {
          // Unexpected case
          setError(data.message || "Could not determine vehicle status.");
          setHasVehicle(true);
        }
      } catch (err) {
        setError("Network error: " + err.message);
        setHasVehicle(true);
      }
    })();
  }, [user]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/update-profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.status) {
        setSuccess("Profile updated successfully!");
        setUser((prev) => ({ ...prev, ...formData }));
      } else {
        setError(result.message || "Failed to update profile.");
      }
    } catch {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">My Profile</h2>

      {success && <Successfull msg={success} />}
      {error   && <ErrorBox   msg={error}   />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            name="name"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>

      {/* Driver-only vehicle link */}
      {user?.role === "driver" && hasVehicle !== null && (
        <div className="mt-6 text-center">
          {hasVehicle ? (
            <Link
              to="/submit-vehicle"
              className="inline-block bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Update Documents
            </Link>
          ) : (
            <Link
              to="/submit-vehicle"
              className="inline-block bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600"
            >
              Submit Documents
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
