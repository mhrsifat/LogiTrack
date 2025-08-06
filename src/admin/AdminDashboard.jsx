import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_drivers: 0,
    total_bookings: 0,
    total_revenue: 0,
    total_vehicles: 0,
    bookings_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Failed to load dashboard");
        setStats(data.data); // ResponseHelper::success wraps your stats in `data`
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (error) return <div className="p-6 text-red-600 text-center">{error}</div>;

  const cards = [
    { label: "Total Users", value: stats.total_users },
    { label: "Total Drivers", value: stats.total_drivers },
    { label: "Total Bookings", value: stats.total_bookings },
    { label: "Total Vehicles", value: stats.total_vehicles },
    { label: "Bookings Today", value: stats.bookings_today },
    { label: "Total Revenue", value: stats.total_revenue },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="p-4 bg-white rounded-2xl shadow hover:scale-[1.02] transition-transform"
          >
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
