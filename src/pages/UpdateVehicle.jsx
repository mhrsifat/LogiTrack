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
    vehicle_type: "",
    license_plate: "",
    capacity: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch driver’s vehicle on mount
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${BASE_URL}/vehicles-driver`, {
          credentials: "include",
        });
        const result = await res.json();
        if (res.ok && result.status === true) {
          setVehicle(result.data);
          setFormData({
            vehicle_type: result.data.vehicle_type || "",
            license_plate: result.data.license_plate || "",
            capacity: result.data.capacity || "",
            status: result.data.status || "",
          });
        } else {
          setError(result.error || "No vehicle found for this driver.");
        }
      } catch (err) {
        setError("Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [user]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${BASE_URL}/vehicles/${vehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (res.ok && result.status === "success") {
        setSuccess("Vehicle updated successfully!");
      } else {
        setError(result.message || "Failed to update vehicle.");
      }
    } catch {
      setError("Server error. Try again.");
    }
  };

  if (loading) return <div className="p-4">Loading vehicle data…</div>;
  if (error) return <ErrorBox msg={error} />;
  if (!vehicle) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Update Vehicle
      </h2>

      {success && <Successfull msg={success} />}
      {error && <ErrorBox msg={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Vehicle Type</label>
          <input
            type="text"
            name="vehicle_type"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.vehicle_type}
            onChange={handleChange}
            required
          />
        </div>

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

        <div>
          <label className="block mb-1 font-medium">Capacity</label>
          <input
            type="number"
            name="capacity"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            className="w-full border px-3 py-2 rounded-lg"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
