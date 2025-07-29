import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import Error from "../components/Error";
import Successfull from "../components/Successfull";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/login");
          return;
        }

        const data = await res.json();

        if (data.success) {
          setStats(data.data);
        } else {
          setErrorMsg("Failed to load dashboard data.");
        }
      } catch (err) {
        setErrorMsg("Server error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  if (errorMsg) {
    return <Error message={errorMsg} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Users" value={stats.total_users} color="bg-blue-500" />
        <DashboardCard title="Total Drivers" value={stats.total_drivers} color="bg-indigo-500" />
        <DashboardCard title="Total Bookings" value={stats.total_bookings} color="bg-purple-500" />
        <DashboardCard title="Total Revenue" value={`৳${stats.total_revenue}`} color="bg-green-500" />
        <DashboardCard title="Total Vehicles" value={stats.total_vehicles} color="bg-yellow-500" />
        <DashboardCard title="Today's Bookings" value={stats.bookings_today} color="bg-pink-500" />
      </div>

      <Successfull message="Dashboard loaded successfully." />
    </div>
  );
};

const DashboardCard = ({ title, value, color }) => (
  <div className={`p-6 rounded-2xl shadow-md text-white ${color}`}>
    <h2 className="text-xl font-semibold mb-1">{title}</h2>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;