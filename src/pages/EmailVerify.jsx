import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config.js";
import ErrorBox from "../components/ErrorBox";
import { useUser } from "../contexts/UserContext";
import Successfull from "../components/Successfull";
import { motion, AnimatePresence } from "framer-motion"; // ✨ Added motion

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailVerify = () => {
  const { setUser } = useUser();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  const loginfunction = () => {
    fetch(BASE_URL + "/autologin", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(BASE_URL + "/verify-email-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (data.status) {
        setMessage("✅ Email verified successfully. Redirecting to profile...");
        setToken("");
        loginfunction();
        timeoutRef.current = setTimeout(() => navigate("/profile"), 2000);
      } else {
        setError(data.message || "❌ Invalid token or email.");
      }
    } catch (e) {
      setError("Something went wrong. Try again. " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    setError("");
    setMessage("");

    if (!emailPattern.test(email)) {
      setError("❌ Invalid email format.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(BASE_URL + "/change-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: email }),
      });

      const data = await res.json();
      if (data.status) {
        setMessage(data.message);
        setEmail("");
        setToken("");
        setShowEmailInput(false);
      } else {
        setError(data.message || "❌ Failed to change email.");
      }
    } catch (err) {
      setError("Network error. Try again later. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm"
      >
        <motion.h2
          className="text-2xl font-semibold mb-4 text-center text-teal-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Email Verification
        </motion.h2>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ErrorBox msg={error} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {message && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Successfull msg={message} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Change Input */}
        <AnimatePresence>
          {showEmailInput && (
            <motion.div
              key="emailChange"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ originY: 0 }} // scale from top
            >
              <label htmlFor="email" className="block mb-1 text-teal-900">
                New Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
                required
                disabled={loading || !!message}
              />
              <button
                type="button"
                onClick={handleEmailChange}
                className="w-full mb-4 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded"
                disabled={loading || !!message}
              >
                {loading ? "Updating..." : "Update Email"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token Input */}
        <motion.label
          htmlFor="token"
          className="block mb-1 text-teal-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Verification Token
        </motion.label>
        <motion.input
          type="text"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
          required
          disabled={loading || showEmailInput || !!message}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />

        <motion.button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded"
          disabled={loading || !!message}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </motion.button>

        <motion.p
          className="text-sm mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Want to change your email?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setShowEmailInput(!showEmailInput)}
            disabled={loading}
          >
            {showEmailInput ? "Cancel" : "Change Email"}
          </button>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default EmailVerify;
