// Core CSS
import "./App.css";

// React Router
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Global Layout Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

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
import VerifyEmail from "./pages/VerifyEmail";

// User Pages
import Profile from "./pages/Profile";
import BookingDetails from "./pages/BookingDetails";
import BookingHistory from "./pages/BookingHistory";
import Dashboard from "./pages/Dashboard";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import BookNow from "./pages/BookNow";
import ApplyAsDriver from "./pages/ApplyAsDriver";

// Booking Offer Flow
import BookingRequestList from "./pages/BookingRequestList"; // Drivers see available bookings
import BookingOfferForm from "./pages/BookingOfferForm"; // Driver submits offer
import BookingOfferList from "./pages/BookingOfferList"; // User sees all offers
import BookingOfferConfirm from "./pages/BookingOfferConfirm"; // User confirms one offer

// Admin Pages
import VehicleManagement from "./pages/VehicleManagement";
import Users from "./admin/Users";
import VehicleList from "./admin/VehicleList";
import VehicleForm from "./admin/VehicleForm";
import VehicleDetails from "./admin/VehicleDetails";

// Extra
import NotFound from "./pages/NotFound";
import BookingHistoryDriver from "./pages/BookingHistoryDriver";
import SubmitVehicle from "./pages/SubmitVehicle";
import UpdateVehicle from "./pages/UpdateVehicle";
import AdminDashboard from "./admin/AdminDashboard";
import SendNotification from "./pages/SendNotification";
import AdminMessages from "./pages/AdminMessages";
import AdminPayments from "./admin/AdminPayments";

// App Wrapper with Header/Footer Layout
const AppWrapper = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <div className="app-wrapper">
        <Header />
        <div className={`main-content ${isHome ? "" : "mt-20"}`}>
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
            <Route path="/booking-details" element={<BookingDetails />} />
            <Route path="/my-bookings" element={<BookingHistory />} />
            <Route path="/book-now" element={<BookNow />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/support" element={<Support />} />
            <Route path="/applyasdriver" element={<ApplyAsDriver />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* Booking Offer Flow Routes */}
            <Route
              path="/booking-requests"
              element={<BookingRequestList />}
            />{" "}
            {/* Driver View */}
            <Route
              path="/booking-history"
              element={<BookingHistoryDriver />}
            />{" "}
            {/* Driver View */}
            <Route
              path="/offer/:bookingId"
              element={<BookingOfferForm />}
            />{" "}
            {/* Driver View */}
            <Route path="/offers/:id" element={<BookingOfferList />} />{" "}
            {/* User View */}
            <Route
              path="/confirm-offer/:offerId"
              element={<BookingOfferConfirm />}
            />{" "}
            {/* User View */}
            {/* Driver Routes */}
            <Route path="/submit-vehicle" element={<SubmitVehicle />} />
            <Route path="/update-vehicle" element={<UpdateVehicle />} />
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route
              path="/admin/vehicle-management"
              element={<VehicleManagement />}
            />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/vehicles" element={<VehicleList />} />
            <Route path="/admin/vehicles/create" element={<VehicleForm />} />
            <Route path="/admin/vehicles/edit/:id" element={<VehicleForm />} />
            <Route path="/admin/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/admin/send-notification" element={<SendNotification />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </>
  );
};

// Main App with Router
const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppWrapper />
    </Router>
  );
};

export default App;
