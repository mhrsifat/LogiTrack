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

  // User creates a booking request
  public function store()
  {
    AccessControl::requireRole(["user"]);
    $currentUser = AccessControl::getCurrentUser();

    if (!$currentUser) {
      return ResponseHelper::unauthorized("User not logged in.");
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Validation
    if (
      empty($data["pickup_address"]) ||
      empty($data["drop_address"]) ||
      empty($data["scheduled_time"])
    ) {
      return ResponseHelper::validationError("pickup_address, drop_address, and scheduled_time are required.");
    }

    $data["user_id"] = $currentUser["id"];
    $data["status"] = "pending";
    $data["vehicle_id"] = $data["vehicle_id"] ?? null; // optional

    if ($this->bookingModel->create($data)) {
      return ResponseHelper::success([], "Booking request created.");
    } else {
      return ResponseHelper::error("Failed to create booking.");
    }
  }

  // Update booking info
  public function update($id)
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

    // Only owner user or admin can update
    if ($currentUser["role"] === "user" && $booking["user_id"] !== $currentUser["id"]) {
      return ResponseHelper::forbidden("You don't have permission to update this booking.");
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if ($this->bookingModel->update($id, $data)) {
      return ResponseHelper::success([], "Booking updated.");
    } else {
      return ResponseHelper::error("Failed to update booking.");
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
}
