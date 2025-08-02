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

  // 📦 List bookings based on role
  public function index()
  {
    AccessControl::requireRole(["admin", "user", "driver"]);

    $currentUser = AccessControl::getCurrentUser();

    if ($currentUser["role"] === "admin") {
      $bookings = $this->bookingModel->getAll();
    } elseif ($currentUser["role"] === "user") {
      $bookings = $this->bookingModel->getByUser($currentUser["id"]);
    } elseif ($currentUser["role"] === "driver") {
      $bookings = $this->bookingModel->getAvailableForDriver();
    } else {
      return ResponseHelper::unauthorized("Invalid role.");
    }

    ResponseHelper::success("Bookings fetched.", $bookings);
  }

  // 🔍 Show a specific booking
  public function show($id)
  {
    AccessControl::requireRole(["admin", "user", "driver"]);

    $booking = $this->bookingModel->getById($id);

    if ($booking) {
      ResponseHelper::success("Booking found", $booking);
    } else {
      ResponseHelper::notFound("Booking not found");
    }
  }

  // 🆕 User creates a booking (gig-style request)
  public function store()
  {
    AccessControl::requireRole(["user"]);
    $currentUser = AccessControl::getCurrentUser();

    $data = json_decode(file_get_contents("php://input"), true);

    // Basic validation
    if (
      empty($data["pickup_address"]) ||
      empty($data["drop_address"]) ||
      empty($data["scheduled_time"])
    ) {
      return ResponseHelper::validationError(
        "pickup_address, drop_address and scheduled_time are required."
      );
    }

    // Add user_id and default status
    $data["user_id"] = $currentUser["id"];
    $data["status"] = "pending";

    if ($this->bookingModel->create($data)) {
      ResponseHelper::success("Booking created successfully.");
    } else {
      ResponseHelper::error("Failed to create booking.");
    }
  }

  // ✏️ Update booking (admin or owner)
  public function update($id)
  {
    AccessControl::requireRole(["admin", "user"]);
    $currentUser = AccessControl::getCurrentUser();

    $booking = $this->bookingModel->getById($id);
    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    // Only allow user to update their own
    if (
      $currentUser["role"] === "user" &&
      $booking["user_id"] !== $currentUser["id"]
    ) {
      return ResponseHelper::forbidden("You can't update this booking.");
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if ($this->bookingModel->update($id, $data)) {
      ResponseHelper::success("Booking updated.");
    } else {
      ResponseHelper::error("Failed to update booking.");
    }
  }

  // ❌ Cancel/delete booking
  public function destroy($id)
  {
    AccessControl::requireRole(["admin", "user"]);
    $currentUser = AccessControl::getCurrentUser();

    $booking = $this->bookingModel->getById($id);
    if (!$booking) {
      return ResponseHelper::notFound("Booking not found.");
    }

    // Only allow user to delete their own
    if (
      $currentUser["role"] === "user" &&
      $booking["user_id"] !== $currentUser["id"]
    ) {
      return ResponseHelper::forbidden("You can't delete this booking.");
    }

    if ($this->bookingModel->delete($id)) {
      ResponseHelper::success("Booking deleted.");
    } else {
      ResponseHelper::error("Failed to delete booking.");
    }
  }
}
