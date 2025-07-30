import React, { useState } from "react";
import { BASE_URL } from "../config";
import { useNavigate } from "react-router-dom";
import ErrorBox from "../components/ErrorBox";
import Successfull from "../components/Successfull";

const ApplyAsDriverFull = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [vehicleType, setVehicleType] = useState("");
  const [experience, setExperience] = useState("");
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDocumentChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const isFormValid =
    form.name &&
    form.username &&
    form.email &&
    form.phone &&
    form.password &&
    form.password === form.confirmPassword &&
    vehicleType &&
    experience;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isFormValid) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "confirmPassword") formData.append(key, value);
      });

      formData.append("vehicle_type", vehicleType);
      formData.append("experience", experience);
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
      setTimeout(() => navigate("/email-verify"), 2000); // ✅ Redirect here
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6 text-center">Apply As a Driver</h2>

      {error && <ErrorBox msg={error} />}
      {success && <Successfull msg={success} />}

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 mb-3 border rounded" required />
        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Username" className="w-full p-2 mb-3 border rounded" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 mb-3 border rounded" required />
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 mb-3 border rounded" required />
        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full p-2 mb-3 border rounded" required />
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className="w-full p-2 mb-3 border rounded" required />

        <input type="text" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} placeholder="Vehicle Type (e.g., Truck, Pickup)" className="w-full p-2 mb-3 border rounded" required />
        <input type="text" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Driving Experience (e.g., 3 years)" className="w-full p-2 mb-3 border rounded" required />

        <label className="block mb-2 font-medium">Upload Documents:</label>
        <input type="file" multiple onChange={handleDocumentChange} className="mb-4" />

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default ApplyAsDriverFull;
