import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import Error from "../components/Error";
import Successfull from "../components/Successfull";
import { BASE_URL } from "../config.js";

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailExistMsg, setEmailExistMsg] = useState("");
  const [userExistMsg, setUserExistMsg] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(2);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Update countdown
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [success]);

  // Navigate when countdown ends
  useEffect(() => {
    if (success && timeLeft === 0) {
      navigate("/email-verify");
    }
  }, [success, timeLeft, navigate]);

  // Handle form field changes
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    if (e.target.id === "email") setEmailExistMsg("");
    if (e.target.id === "username") setUserExistMsg("");
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match");
      return;
    }
    setLoading(true);
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...formData } = form;
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.status) setSuccess("Registration Successful. Please verify your email.");
      else if (data.errors) setError(Object.values(data.errors).join(", "));
      else if (data.message) setError(data.message);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Check email existence
  async function emailcheck(value) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) return;
    try {
      const res = await fetch(`${BASE_URL}/verify-email-exist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      setEmailExistMsg(data.message);
      setEmailStatus(data.status ? "success" : "error");
    } catch (err) {
      console.error(err);
    }
  }

  // Check username existence and validity
  async function userExist(value) {
    if (!value) return;
    if (value.length < 4) {
      setUserExistMsg("Must be more than 4 characters.");
      setUserStatus("error");
      return;
    }
    if (/^\d/.test(value)) {
      setUserExistMsg("Username cannot start with a number.");
      setUserStatus("error");
      return;
    }
    if (/\s/.test(value)) {
      setUserExistMsg("Username cannot contain spaces.");
      setUserStatus("error");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/user-exist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const data = await res.json();
      setUserExistMsg(data.message);
      setUserStatus(data.status ? "success" : "error");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm my-7"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-teal-700">
          Register Form
        </h2>
        {error && <Error msg={error} />}
        {success && <Successfull msg={`${success} ${timeLeft}`} />}

        {/* Name */}
        <label htmlFor="name" className="block mb-1 text-teal-900">Name</label>
        <input
          type="text"
          id="name"
          value={form.name}
          onChange={handleInputChange}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
        />

        {/* Username */}
        <label htmlFor="username" className="block mb-1 text-teal-900">Username</label>
        <input
          type="text"
          id="username"
          value={form.username}
          onChange={(e) => { handleInputChange(e); userExist(e.target.value); }}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
        />
        {userExistMsg && (
          <p className={`text-sm mb-4 ${userStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{userExistMsg}</p>
        )}

        {/* Email */}
        <label htmlFor="email" className="block mb-1 text-teal-900">Email</label>
        <input
          type="email"
          id="email"
          value={form.email}
          onChange={(e) => { handleInputChange(e); emailcheck(e.target.value); }}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
        />
        {emailExistMsg && (
          <p className={`text-sm mb-4 ${emailStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{emailExistMsg}</p>
        )}

        {/* Phone */}
        <label htmlFor="phone" className="block mb-1 text-teal-900">Phone</label>
        <input
          type="text"
          id="phone"
          value={form.phone}
          onChange={handleInputChange}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
        />

        {/* Password */}
        <label htmlFor="password" className="block mb-1 text-teal-900">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={form.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-teal-900 rounded"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="absolute top-3 right-3 text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        {/* Confirm Password */}
        <label htmlFor="confirmPassword" className="block mb-1 text-teal-900">Confirm Password</label>
        <div className="relative mb-6">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={form.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-teal-900 rounded"
          />
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEyeSlash : faEye}
            className="absolute top-3 right-3 text-gray-600 cursor-pointer"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          className={`w-full flex justify-center items-center py-2 rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="flex items-center"
            >
              <FontAwesomeIcon icon={faSpinner} spin />
            </motion.span>
          ) : (
            'Register'
          )}
        </motion.button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/Login" className="text-blue-600 hover:underline">Login Now</Link>
        </p>
      </motion.form>
      <motion.div className="">
        <Link to="/applyasdriver" className="flex justify-center bg-blue-200 text-red-600">Apply As a Driver</Link>

      </motion.div>
    </div>
  );
};

export default Register;
