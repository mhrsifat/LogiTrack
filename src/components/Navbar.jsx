import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { BASE_URL } from "../config.js";

const Navbar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const dropdownRef = useRef(null);

  const logout = async () => {
    await fetch(BASE_URL + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  const logoutAll = async () => {
    await fetch(BASE_URL + "/auth/logout-all", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/login");
  };

  const handleLogoutToggle = () => {
    setShowLogoutMenu((prev) => !prev);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";
  const isUser = user?.role === "user";
  const isOperator = user?.role === "operator";

  return (
    <ul className="flex gap-4 items-center text-sm font-medium relative">
      {user && (
        <>
          <li>
            <Link to="/profile" className="hover:underline">
              Profile
            </Link>
          </li>

          {isAdmin && (
            <>
              <li>
                <Link to="/admin/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="hover:underline">
                  Users
                </Link>
              </li>
              <li>
                <Link to="/admin/vehicles" className="hover:underline">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to="/admin/price-rates" className="hover:underline">
                  Price Rates
                </Link>
              </li>
            </>
          )}

          {isDriver && (
            <>
              <li>
                <Link to="/driver/bookings" className="hover:underline">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/driver/documents" className="hover:underline">
                  My Documents
                </Link>
              </li>
            </>
          )}

          {isUser && (
            <>
              <li>
                <Link to="/book-now" className="hover:underline">
                  Book Now
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:underline">
                  My Bookings
                </Link>
              </li>
            </>
          )}

          {isOperator && (
            <>
              <li>
                <Link to="/operator/bookings" className="hover:underline">
                  Manage Bookings
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/notifications" className="hover:underline">
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/support" className="hover:underline">
              Support
            </Link>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={handleLogoutToggle}
              className="ml-2 px-3 py-1 bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>

            {showLogoutMenu && (
              <div className="absolute top-full right-0 bg-white shadow-md border mt-2 rounded z-10 text-black text-sm">
                <button
                  onClick={logout}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  Logout from this device
                </button>
                <button
                  onClick={logoutAll}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  Logout from all devices
                </button>
              </div>
            )}
          </li>
        </>
      )}

      {!user && (
        <>
          <li>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          </li>
          <li>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </li>
        </>
      )}
    </ul>
  );
};

export default Navbar;
