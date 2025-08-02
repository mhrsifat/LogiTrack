// src/App.jsx
// Core CSS
import "./App.css";

// React Router
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

// Global layout components
import Header from "./components/Header";
import Footer from "./components/Footer";

// =====================
// Page Imports
// =====================

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerify from "./pages/EmailVerify";

// User Pages
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";
import BookingHistory from "./pages/BookingHistory";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";

// Admin Pages
import VehicleManagement from "./pages/VehicleManagement";
import Users from "./admin/Users";
import VehicleList from "./admin/VehicleList";
import VehicleForm from "./admin/VehicleForm";
import VehicleDetails from "./admin/VehicleDetails";

// Extra Pages
import Admin from "./admin/admin";
import BookNow from "./pages/BookNow";
import ApplyAsDriver from "./pages/ApplyAsDriver";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

// ✅ Create wrapper to use hooks
const AppWrapper = () => {
    const location = useLocation();
    const isHome = location.pathname === "/";

    return (
        <>
            <Header />
            <div className={`${isHome ? "" : "mt-20"}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/email-verify" element={<EmailVerify />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />

                    {/* User Routes */}
                    <Route path="/profile" element={<Profile />} />
                    <Route
                        path="/booking-details"
                        element={<BookingDetails />}
                    />
                    <Route path="/my-bookings" element={<BookingHistory />} />
                    <Route path="/book-now" element={<BookNow />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/applyasdriver" element={<ApplyAsDriver />} />
                    <Route path="/notifications" element={<Notifications />} />

                    {/* Admin Routes */}
                    <Route
                        path="/admin/vehicle-management"
                        element={<VehicleManagement />}
                    />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/vehicles" element={<VehicleList />} />
                    <Route
                        path="/admin/vehicles/create"
                        element={<VehicleForm />}
                    />
                    <Route
                        path="/admin/vehicles/edit/:id"
                        element={<VehicleForm />}
                    />
                    <Route
                        path="/admin/vehicles/:id"
                        element={<VehicleDetails />}
                    />
                    <Route path="/admin/*" element={<Admin />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
};

// ✅ Use Router here and render wrapper inside
const App = () => {
    return (
        <Router>
            <ScrollToTop />
            <AppWrapper />
        </Router>
    );
};

export default App;
