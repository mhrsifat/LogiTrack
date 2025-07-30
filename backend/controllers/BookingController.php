<?php
require_once __DIR__ . '/../models/Booking.php';
require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class BookingController {
    private $bookingModel;

    public function __construct() {
        $this->bookingModel = new Booking();
    }

    public function index() {
        AccessControl::requireRole(['admin', 'user', 'driver']);

        $bookings = $this->bookingModel->getAll();
        ResponseHelper::success($bookings);
    }

    public function show($id) {
        AccessControl::requireRole(['admin', 'user', 'driver']);

        $booking = $this->bookingModel->getById($id);
        if ($booking) {
            ResponseHelper::success($booking);
        } else {
            ResponseHelper::error("Booking not found", 404);
        }
    }

    public function store() {
        AccessControl::requireRole(['user']);

        $data = json_decode(file_get_contents("php://input"), true);


        if ($this->bookingModel->create($data)) {
            ResponseHelper::success("Booking created");
        } else {
            ResponseHelper::error("Failed to create booking");
        }
    }

    public function update($id) {
        AccessControl::requireRole(['admin', 'user']);

        $data = json_decode(file_get_contents("php://input"), true);

        if ($this->bookingModel->update($id, $data)) {
            ResponseHelper::success("Booking updated");
        } else {
            ResponseHelper::error("Failed to update booking");
        }
    }

    public function destroy($id) {
        AccessControl::requireRole(['admin', 'user']);

        if ($this->bookingModel->delete($id)) {
            ResponseHelper::success("Booking deleted");
        } else {
            ResponseHelper::error("Failed to delete booking");
        }
    }
}