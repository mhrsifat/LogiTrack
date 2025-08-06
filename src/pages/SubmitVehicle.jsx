import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";

const SubmitVehicle = () => {
  const [formData, setFormData] = useState({
    type: "",
    license_plate: "",
    capacity_kg: "",
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hideForm, setHideForm] = useState(false);

  // Handle text inputs
  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Handle files input
  const handleFiles = (e) => setDocuments(Array.from(e.target.files));

  // On mount, check if vehicle already exists
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(BASE_URL + "/vehicles-exist", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          // If the API returns 400 for "already exists", hide the form
          setError(data.message || "Unable to check submission status.");
          setHideForm(true);
        } else {
          // data.status === true means "No vehicle submitted yet"
          if (data.status !== true) {
            // unexpected but hide form just in case
            setHideForm(true);
          }
        }
      } catch (err) {
        setError("Network error: " + err.message);
        setHideForm(true);
      }
    })();
  }, []);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("document_type", formData.type);
      form.append("license_plate", formData.license_plate);
      form.append("capacity_kg", formData.capacity_kg);
      documents.forEach((file) => form.append("documents[]", file));

      const res = await fetch(BASE_URL + "/vehicle-documents", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setSuccess("Vehicle submitted successfully.");
      // Hide form after success
      setHideForm(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-2xl shadow">
      <h2 className="text-xl font-semibold mb-4">Submit Vehicle</h2>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      {!hideForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Vehicle Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="truck">Truck</option>
              <option value="pickup">Pickup</option>
              <option value="van">Van</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">License Plate</label>
            <input
              type="text"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Capacity (kg)</label>
            <input
              type="number"
              name="capacity_kg"
              value={formData.capacity_kg}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Documents</label>
            <input
              type="file"
              onChange={handleFiles}
              multiple
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 rounded-2xl shadow font-medium"
          >
            {loading ? "Submitting..." : "Submit Vehicle"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SubmitVehicle;
