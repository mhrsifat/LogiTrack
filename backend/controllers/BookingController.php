<?php
require_once __DIR__ . "/../models/Booking.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/AccessControl.php";

class BookingController
{
  private $bookingModel;

  public function __construct()
  {
    $this->bookingModel = new Booking();
  }

  // List bookings based on role
  public function index()
  {
    AccessControl::requireRole(["admin", "user", "driver"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("User not logged in.");
    }

    $role = $currentUser["role"];
    $userId = $currentUser["id"];

    if ($role === "admin") {
      $bookings = $this->bookingModel->getAll();
    } elseif ($role === "user") {
      $bookings = $this->bookingModel->getByUser($userId);
    } elseif ($role === "driver") {
      $bookings = $this->bookingModel->getAvailableForDriver();
    } else {
      return ResponseHelper::unauthorized("Unauthorized role.");
    }

    return ResponseHelper::success($bookings, "Bookings fetched.");
  }

  // Show a specific booking
  public function show($id)
  {
    AccessControl::requireRole(["admin", "user", "driver"]);
    $booking = $this->bookingModel->getById($id);

    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    return ResponseHelper::success($booking, "Booking found.");
  }

  public function store()
  {
    AccessControl::requireRole(["user"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("User not logged in.");
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Validation for required fields
    if (
      empty($data["pickup_address"]) ||
      empty($data["drop_address"]) ||
      empty($data["scheduled_time"])
    ) {
      return ResponseHelper::validationError("pickup_address, drop_address, and scheduled_time are required.");
    }

    // Validate scheduled_time is not in the past
    $scheduledTimestamp = strtotime(str_replace('T', ' ', $data["scheduled_time"]));
    $currentTimestamp = time();

    if ($scheduledTimestamp === false) {
      return ResponseHelper::validationError([], "Invalid scheduled_time format.");
    }

    if ($scheduledTimestamp < $currentTimestamp) {
      return ResponseHelper::validationError([], "Scheduled Time cannot be in the past.");
    }

    $data["user_id"] = $currentUser["id"];
    $data["status"] = "pending";
    $data["vehicle_id"] = $data["vehicle_id"] ?? null;

    if ($this->bookingModel->create($data)) {
      return ResponseHelper::success([], "Booking request created.");
    } else {
      return ResponseHelper::error("Failed to create booking.");
    }
  }

  // Update booking info
  public function updateOffer()
  {
    AccessControl::requireRole(["driver"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("Driver not logged in.");
    }


    $data = json_decode(file_get_contents("php://input"), true);
    $bookingId = $data['booking_id'];

    $booking = $this->bookingModel->getById($bookingId);
    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    if ($booking["status"] !== "pending") {
      return ResponseHelper::badRequest("Cannot offer on a non-pending booking.");
    }

    if (empty($data["proposed_price"]) || !is_numeric($data["proposed_price"])) {
      return ResponseHelper::validationError("Valid proposed_price is required.");
    }

    $success = $this->bookingModel->updateOffer(
      $bookingId,
      $currentUser["id"],
      $data["proposed_price"],
      $data["message"] ?? null
    );

    if ($success) {
      return ResponseHelper::success([], "Offer sent successfully.");
    } else {
      return ResponseHelper::error("Failed to send offer.");
    }
  }

  // Delete booking
  public function destroy($id)
  {
    AccessControl::requireRole(["admin", "user"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("User not logged in.");
    }

    $booking = $this->bookingModel->getById($id);
    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    // Only owner user or admin can delete
    if ($currentUser["role"] === "user" && $booking["user_id"] !== $currentUser["id"]) {
      return ResponseHelper::forbidden("You don't have permission to delete this booking.");
    }

    if ($this->bookingModel->delete($id)) {
      return ResponseHelper::success([], "Booking deleted.");
    } else {
      return ResponseHelper::error("Failed to delete booking.");
    }
  }

  public function sendOffer()
  {
    AccessControl::requireRole(["driver"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("Driver not logged in.");
    }


    $data = json_decode(file_get_contents("php://input"), true);
    $bookingId = $data['booking_id'];

    $booking = $this->bookingModel->getById($bookingId);
    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    if ($booking["status"] !== "pending") {
      return ResponseHelper::badRequest("Cannot offer on a non-pending booking.");
    }

    if (empty($data["proposed_price"]) || !is_numeric($data["proposed_price"])) {
      return ResponseHelper::validationError("Valid proposed_price is required.");
    }

    $success = $this->bookingModel->createOffer(
      $bookingId,
      $currentUser["id"],
      $data["proposed_price"],
      $data["message"] ?? null
    );

    if ($success) {
      return ResponseHelper::success([], "Offer sent successfully.");
    } else {
      return ResponseHelper::error("Failed to send offer.");
    }
  }

  public function getOffers($bookingId)
  {
    AccessControl::requireRole(["admin", "user", "driver"]);

    $offers = $this->bookingModel->getOffersByBookingId($bookingId);
    return ResponseHelper::success($offers, "Offers fetched.");
  }

  public function indexBookingHistory()
  {
    AccessControl::requireRole(['driver']);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("User not logged in.");
    }

    $driverId = $currentUser['id'];

    $offers = $this->bookingModel->getOffersByDriver($driverId);

    return ResponseHelper::success($offers, "Driver's booking offers fetched.");
  }
}
