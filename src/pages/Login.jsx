import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "motion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Link, Navigate, useNavigate } from "react-router-dom";
import ErrorBox from "../components/ErrorBox";
import Successfull from "../components/Successfull";
import { BASE_URL } from "../config";
import { useUser } from "../contexts/UserContext";

const Login = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(5);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success]);

  useEffect(() => {
    if (timeLeft === 0 && success) {
      navigate("/");
    }
  }, [timeLeft, success, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(BASE_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          remember: rememberMe,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (data.status) {
        setSuccess("Login Successful. redirecting to home in ");
        setUser(data.data);
      }
      if (!data.status) {
        setError("login Failed");
      }

      // Optional: Redirect or show error based on response
    } catch (err) {
      console.log("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-teal-700">
          Login
        </h2>
        {error && <ErrorBox msg={error} />}
        {success && <Successfull msg={`${success} ${timeLeft} `} />}
        <label htmlFor="username" className="block mb-1 text-teal-900">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={form.username}
          onChange={handleInputChange}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <label htmlFor="password" className="block mb-1 text-teal-900">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={form.password}
            onChange={handleInputChange}
            className="w-full mb-4 px-3 py-2 border border-teal-900 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="absolute top-3 right-3 text-gray-600 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        <div className="py-2 mb-1">
          <input
            type="checkbox"
            id="rememberme"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />{" "}
          Remember me?
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={!loading ? { scale: 1.05 } : {}}
          whileTap={!loading ? { scale: 0.95 } : {}}
          className={`w-full flex justify-center items-center py-2 rounded 
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }
          `}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="flex items-center"
            >
              <FontAwesomeIcon icon={faSpinner} spin={false} />
            </motion.span>
          ) : (
            "Login"
          )}
        </motion.button>
        <p className="mt-2 py-2">
          Dont have a account.{" "}
          <Link to="/register" className="text-blue-600">
            Register Now
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
