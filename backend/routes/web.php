<?php

// ===============================
// 🌐 Web Routes Configuration
// ===============================

/*
|--------------------------------------------------------------------------
| 🏠 Home & 🔐 Authentication
|--------------------------------------------------------------------------
| Routes for homepage access and user authentication.
*/

$router->get('/', 'HomeController@index'); // Public Home Page

// Auth Actions
$router->post('/login', 'AuthController@login'); // User login
$router->post('/register', 'AuthController@register'); // New user registration
$router->post('/drivers/applyDriver', 'DriverApplicationController@applyDriver');

$router->post('/autologin', 'AuthController@autologin'); // Auto-login via token/session
$router->post('/auth/logout', 'AuthController@logout'); // Logout current session
$router->post('/auth/logout-all', 'AuthController@logoutFromAllDevices'); // Logout all sessions

// Email & Account Checks
$router->get('/verify-email', 'AuthController@verifyEmail'); // Email verification link
$router->post('/verify-email-token', 'AuthController@verifyEmailToken'); // Email verification token validation
$router->post('/verify-email-exist', 'AuthController@isEmailExist'); // Check if email already exists
$router->post('/user-exist', 'AuthController@userExistFunction'); // Check if user exists
$router->post('/change-email', 'AuthController@updateemail'); // Change user's email address

/*
|--------------------------------------------------------------------------
| 👤 User Management (Admin Only)
|--------------------------------------------------------------------------
| Admin-only access for managing registered users.
*/

$router->get('/users', 'UserController@index'); // List all users
//$router->get('/users/{id}', 'UserController@show'); // Show single user info
$router->put('/users/{id}', 'UserController@update'); // Update user info
$router->delete('/users/{id}', 'UserController@destroy'); // Delete user

/*
|--------------------------------------------------------------------------
| 🚚 Vehicle Management (Admin Only)
|--------------------------------------------------------------------------
| Admin routes to manage vehicles in the system.
*/

$router->get('/vehicles', 'VehicleController@index'); // List all vehicles \\
$router->get('/vehicles-exist', 'VehicleController@vehicleExist'); // List if vehicles exist for driver \\
$router->get('/vehicles/{id}', 'VehicleController@show'); // Show specific vehicle \\
$router->get('/vehicles-driver', 'VehicleController@showDriverVehicle'); // Show specific vehicle 
$router->post('/vehicle-documents', 'VehicleDocumentController@handleSubmitDocument'); // Create new vehicle
$router->post('/vehicles/{id}', 'VehicleController@update'); // Update vehicle info
$router->delete('/vehicles/{id}', 'VehicleController@destroy'); // Delete vehicle

/*
|--------------------------------------------------------------------------
| 📦 Booking Management (User & Driver)
|--------------------------------------------------------------------------
| User posts a booking request (like a gig), drivers send offers, and user accepts.
*/

// Bookings (requested by user)
$router->get('/bookings', 'BookingController@index'); // List bookings (own or all by role)
$router->get('/bookings/{id}', 'BookingController@show'); // Show booking
$router->post('/bookings', 'BookingController@store'); // Create booking request
$router->put('/bookings/{id}', 'BookingController@update'); // Update booking (optional)
$router->delete('/bookings/{id}', 'BookingController@destroy'); // Cancel booking

// Offers (sent by driver)
$router->post('/booking-offers', 'BookingOfferController@store'); // Driver sends offer
$router->get('/booking-offers/{booking_id}', 'BookingOfferController@getOffersByBooking'); // List all offers for a booking
//$router->post('/booking-offers/{id}/accept', 'BookingOfferController@acceptOffer'); // User accepts one offer
//$router->post('/booking-offers/{id}/decline', 'BookingOfferController@declineOffer'); // User declines one offer (optional)

// Booking offers (Driver sends offers)
//$router->post('/booking-offers-driver', 'BookingController@sendOffer');
$router->get('/bookings-history-driver', 'BookingController@indexBookingHistory'); // List bookings history for driver(own)


/*
|--------------------------------------------------------------------------
| 💳 Payment Processing (Admin/User)
|--------------------------------------------------------------------------
| Handle and record payment transactions.
*/

//$router->get('/payments', 'PaymentController@index'); // List all payments
//$router->post('/payments', 'PaymentController@store'); // Record a new payment

/*
|--------------------------------------------------------------------------
| ⭐ Ratings & Reviews (User)
|--------------------------------------------------------------------------
| Submit and fetch ratings for completed trips.
*/

//$router->get('/ratings', 'RatingController@index'); // List all ratings
//$router->post('/ratings', 'RatingController@store'); // Submit a new rating

/*
|--------------------------------------------------------------------------
| 🔔 Notifications (All Users)
|--------------------------------------------------------------------------
| Notification system for users, drivers, and admins.
*/
$router->get('/notifications',                'NotificationController@index');         // list for current user
$router->get('/notifications/unread-count',   'NotificationController@unreadCount');   // unread count
$router->put('/notifications/{id}/read',      'NotificationController@markAsRead');    // mark one
$router->put('/notifications/read-all',       'NotificationController@markAllAsRead'); // mark all
$router->post('/notifications',               'NotificationController@create');        // send (admin only)
/*
|--------------------------------------------------------------------------
| 📄 Vehicle Documents (Driver)
|--------------------------------------------------------------------------
| Upload, update, and delete vehicle-related documents.
*/

//$router->get('/vehicle-documents', 'VehicleDocumentController@index'); // List documents
//$router->put('/vehicle-documents/{id}', 'VehicleDocumentController@update'); // Update document
$router->delete('/vehicle-documents/{id}', 'VehicleDocumentController@destroy'); // Delete doc

/*
|--------------------------------------------------------------------------
| 🛠️ Support Tickets (User & Admin)
|--------------------------------------------------------------------------
| Ticketing system for help and customer support.
*/

$router->get('/support-tickets', 'SupportTicketController@index'); // List support tickets
$router->get('/support-tickets/{id}', 'SupportTicketController@show'); // View ticket details
$router->post('/support-tickets', 'SupportTicketController@store'); // Submit a new ticket
$router->put('/support-tickets/{id}', 'SupportTicketController@update'); // Update a ticket
$router->put('/support-tickets-admin/{id}', 'SupportTicketController@updateForAdmin'); // Update a ticket for admin
$router->delete('/support-tickets/{id}', 'SupportTicketController@destroy'); // Delete a ticket
// Fetch all messages for a ticket (GET /support-tickets/{ticketId}/messages)
$router->get(
    '/support-tickets/{ticketId}/messages',
    'SupportTicketController@getMessages'
);
// Post a new message to a ticket (POST /support-tickets/{ticketId}/messages)
$router->post(
    '/support-tickets/{ticketId}/messages',
    'SupportTicketController@postMessage'
);


/*
for contact page
*/
$router->post("/contact", 'ContactController@sendEmail');
$router->post("/send-reply", 'ContactController@sendReply');
$router->get("/list-message", 'ContactController@listMessages');
$router->get("/message-mark-as-unread/{id}", 'ContactController@markUnread');
$router->get("/message-mark-as-read/{id}", 'ContactController@markRead');
$router->delete("/delete/message/{id}", 'ContactController@deleteMessage');



/*
|--------------------------------------------------------------------------
| 🧠 Admin Dashboard
|--------------------------------------------------------------------------
| Central admin panel to view metrics, summaries, etc.
*/

$router->get('/admin/dashboard', 'AdminController@dashboard'); // Admin metrics and overview
