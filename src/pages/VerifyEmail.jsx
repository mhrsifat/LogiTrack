import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`${BASE_URL}/verify-email?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status) {
            setMessage("✅ Email verified successfully. Redirecting to profile...");
            setTimeout(() => {
              navigate("/profile"); 
            }, 3000);
          } else {
            setMessage("❌ Invalid or expired token.");
          }
        })
        .catch((err) => {
          setMessage("❌ Error verifying email.");
          console.log(err);
        });
    }
  }, [token, navigate]);

  return (
    <div>
      <h2>Email Verification</h2>
      <p>{message || "Verifying..."}</p>
    </div>
  );
};

export default VerifyEmail;
