import React, { useState } from "react";
import { BASE_URL } from "../config";
import Error from "../components/Error";
import Successfull from "../components/Successfull";
import { useNavigate } from "react-router-dom";

const ApplyAsDriverFull = () => {
  const navigate = useNavigate();

  // User registration fields
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Driver application fields
  const [vehicleType, setVehicleType] = useState("");
  const [documents, setDocuments] = useState([]);
  const [experience, setExperience] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // eslint-disable-next-line no-unused-vars
  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all registration fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    if (!vehicleType || documents.length === 0 || !experience) {
      setError("Please fill in all driver application fields and upload documents.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // Append registration fields
      formData.append("name", form.name);
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);

      // Append driver application fields
      formData.append("vehicle_type", vehicleType);
      formData.append("experience", experience);

      // Append documents
      documents.forEach((doc) => {
        formData.append("documents[]", doc);
      });

      const res = await fetch(`${BASE_URL}/drivers/applyDriver`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Application failed");

      setSuccess("Application submitted successfully.");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login or dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Register & Apply as a Driver</h2>

      {error && <Error message={error} />}
      {success && <Successfull message={success} />}

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        {/* Registration Fields */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Username</label>
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Phone</label>
          <input
            id="phone"
            type="text"
            value={form.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Driver Application Fields */}
        <div>
          <label className="block font-medium">Vehicle Type</label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Vehicle Type</option>
            <option value="truck">Truck</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Driving Experience (years)</label>
          <input
            type="number"
            min="0"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., 2"
          />
        </div>

        <div>
          <label className="block font-medium">Upload Vehicle Documents</label>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => setDocuments([...e.target.files])}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Register & Apply"}
        </button>
      </form>
    </div>
  );
};

export default ApplyAsDriverFull;
