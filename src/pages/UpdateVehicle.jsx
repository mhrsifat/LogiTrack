/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { BASE_URL } from "../config";
import Successfull from "../components/Successfull";
import ErrorBox from "../components/ErrorBox";

const UpdateVehicle = () => {
  const { user } = useUser();
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    license_plate: "",
    capacity_kg: "",
    status: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch driver's vehicle
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${BASE_URL}/vehicles-driver`, {
          credentials: "include",
        });
        const json = await res.json();
        const v = json.data?.[0];
        if (v) {
          setVehicle(v);
          setFormData({
            type: v.type || "",
            license_plate: v.license_plate || "",
            capacity_kg: v.capacity_kg || "",
            status: v.status || "pending",
          });
        } else {
          setError("No vehicle record found.");
        }
      } catch {
        setError("Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setFile(files[0]);
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // validate capacity
    if (Number(formData.capacity_kg) <= 0) {
      setError("Capacity must be a positive number.");
      return;
    }

    const fd = new FormData();
    fd.append("type", formData.type);
    fd.append("license_plate", formData.license_plate);
    fd.append("capacity_kg", formData.capacity_kg);
    fd.append("status", formData.status);
    if (file) {
      fd.append("photo", file);
    }

    try {
      const res = await fetch(
        `${BASE_URL}/vehicles/${vehicle.id}`,
        {
          method: "POST",
          credentials: "include",
          body: fd,
        }
      );
      const json = await res.json();
      if (res.ok && json.status) {
        setSuccess("Vehicle updated successfully!");
      } else {
        setError(json.message || "Failed to update vehicle.");
      }
    } catch {
      setError("Server error. Try again.");
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error && !vehicle) return <ErrorBox msg={error} />;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Update Vehicle
      </h2>

      {success && <Successfull msg={success} />}
      {error && vehicle && <ErrorBox msg={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Type */}
        <div>
          <label className="block mb-1 font-medium">Vehicle Type</label>
          <select
            name="type"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="truck">Truck</option>
            <option value="pickup">Pickup</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* License Plate */}
        <div>
          <label className="block mb-1 font-medium">License Plate</label>
          <input
            type="text"
            name="license_plate"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.license_plate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block mb-1 font-medium">Capacity (kg)</label>
          <input
            type="number"
            name="capacity_kg"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.capacity_kg}
            onChange={handleChange}
            required
          />
        </div>

          {/* Document Upload for vehicle_documents */}
  <div>
    <label className="block mb-1 font-medium">Upload Document</label>
    <input
      type="file"
      name="document"
      accept="image/*,.pdf"
      onChange={handleChange}
      className="w-full"
    />
  </div>


        {/* Status Badge (read-only) */}
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <span
            className={`inline-block w-full border px-3 py-2 rounded-lg text-center ${
              vehicle.status === "approved"
                ? "bg-green-100 text-green-700"
                : vehicle.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {vehicle.status}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Update Vehicle
        </button>
      </form>
    </div>
  );
};

export default UpdateVehicle;
