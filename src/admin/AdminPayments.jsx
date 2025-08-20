import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(`${BASE_URL}/payments`);
        if (!res.ok) {
          throw new Error("Failed to fetch payments");
        }
        const data = await res.json();
        setPayments(data.data);
      } catch (error) {
        console.error("Failed to load payments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Handle Approve/Reject
  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${BASE_URL}/payments/${id}/${action}`, {
        method: "POST",
      });
      const result = await res.json();

      if (result.status) {
        const newStatus = action === "approve" ? "approved" : "rejected";
        setPayments((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      } else {
        alert("Action failed: " + result.message);
      }
    } catch (error) {
      console.error("Failed to update payment", error);
    }
  };

  if (loading) return <div>Loading payments...</div>;

  if (payments.length === 0)
    return <div className="p-4">No payments found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Admin Payments Management</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Booking</th>
            <th className="border p-2">User</th>
            <th className="border p-2">Driver</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.id}</td>
              <td className="border p-2">{p.booking_id}</td>
              <td className="border p-2">{p.user_name}</td>
              <td className="border p-2">{p.driver_name}</td>
              <td className="border p-2">${p.amount}</td>
              <td className="border p-2 capitalize">{p.status}</td>
              <td className="border p-2">
                {new Date(p.created_at).toLocaleString()}
              </td>
              <td className="border p-2 flex gap-2">
                {p.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAction(p.id, "approve")}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(p.id, "reject")}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                {p.status !== "pending" && (
                  <span className="text-gray-500">No Action</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPayments;
