import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config.js";
import Error from "../components/Error";
import { useUser } from "../contexts/UserContext";
import Successfull from "../components/Successfull";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center text-teal-700">
          Email Verification
        </h2>

        {error && <Error msg={error} />}
        {message && <Successfull msg={message} />}

        {/* Email Change Input */}
        {showEmailInput && (
          <>
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
          </>
        )}

        {/* Token Input */}
        <label htmlFor="token" className="block mb-1 text-teal-900">
          Verification Token
        </label>
        <input
          type="text"
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full mb-4 px-3 py-2 border border-teal-900 rounded"
          required
          disabled={loading || showEmailInput || !!message}
        />

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded"
          disabled={loading || !!message}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <p className="text-sm mt-4 text-center">
          Want to change your email?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setShowEmailInput(!showEmailInput)}
            disabled={loading}
          >
            {showEmailInput ? "Cancel" : "Change Email"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default EmailVerify;