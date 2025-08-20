import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { BASE_URL } from "../config";
import { fetchUnreadCount } from "../api/NotificationAPI";


const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const dropdownRef = useRef(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const logout = async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  const logoutAll = async () => {
    await fetch(`${BASE_URL}/auth/logout-all`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  const handleLogoutToggle = () => {
    setShowLogoutMenu((prev) => !prev);
  };

  // Close the dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadCount = async () => {
      const res = await fetchUnreadCount();
      if (mounted && res.status) setUnreadCount(res.data.unread);
    };
    loadCount();
    const interval = setInterval(loadCount, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";
  const isUser = user?.role === "user";
  const isOperator = user?.role === "operator";

  return (
    <nav className="w-full flex justify-center">
      <ul className="flex flex-col items-center justify-center sm:flex-col md:flex-row gap-4 text-sm font-medium relative">
        {user ? (
          <>
            <li>
              <Link
                to="/profile"
                className="hover:text-blue-500 p-2 rounded-lg"
              >
                Profile
              </Link>
            </li>

            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/vehicles"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Vehicles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/payments"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Payments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/messages"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Messages
                  </Link>
                </li>
              </>
            )}

            {isDriver && (
              <>
                <li>
                  <Link
                    to="/booking-requests"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Find Bookings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/booking-history"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Booking History
                  </Link>
                </li>
              </>
            )}

            {isUser && (
              <>
                <li>
                  <Link
                    to="/book-now"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    Book Now
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-bookings"
                    className="hover:text-blue-500 p-2 rounded-lg"
                  >
                    My Bookings
                  </Link>
                </li>
              </>
            )}

            {isOperator && (
              <li>
                <Link
                  to="/operator/bookings"
                  className="hover:text-blue-500 p-2 rounded-lg"
                >
                  Manage Bookings
                </Link>
              </li>
            )}

            <li>
              <Link to="/notifications" className="flex items-center">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 px-2 py-1 text-xs text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/support"
                className="hover:text-blue-500 p-2 rounded-lg"
              >
                Support
              </Link>
            </li>

            <li className="relative" ref={dropdownRef}>
              <button
                onClick={handleLogoutToggle}
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>

              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded text-black text-sm z-50">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout from this device
                  </button>
                  <button
                    onClick={logoutAll}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout from all devices
                  </button>
                </div>
              )}
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="hover:text-blue-500 p-2 rounded-lg">
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="hover:text-blue-500 p-2 rounded-lg"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
