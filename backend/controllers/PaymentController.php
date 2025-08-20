<?php

require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../core/ResponseHelper.php';

class PaymentController
{
    private $paymentModel;

    public function __construct()
    {
        $this->paymentModel = new Payment();
    }

    // List all payments
    public function index()
    {
        $payments = $this->paymentModel->getAllPayments();
        ResponseHelper::success($payments);
    }

    // Record a new payment
    public function store()
    {

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        if (!$data || !isset($data['booking_id'], $data['amount'], $data['method'])) {
            ResponseHelper::error("Missing required payment fields", 400);
            return;
        }

        // Status can be optionally provided; defaults to 'pending'
        if (!isset($data['status'])) {
            $data['status'] = 'pending';
        }

        // Optional fields: transaction_id and paid_at (paid_at should be a valid datetime string if provided)
        $data['transaction_id'] = isset($data['transaction_id']) ? $data['transaction_id'] : null;
        $data['paid_at'] = isset($data['paid_at']) ? $data['paid_at'] : null;

        $success = $this->paymentModel->createPayment($data);

        if ($success) {
            require_once __DIR__ . '/../models/Booking.php';
            $bookingModel = new Booking();

            if (!isset($data['selected_offer_id'])) {
                ResponseHelper::error("Missing selected_offer_id for booking", 400);
                return;
            }

            $bookingModel->selected_offer_id($data['booking_id'], $data['selected_offer_id']);

            ResponseHelper::success([], "Payment recorded successfully. Wait for Confirmation!", 201);
        } else {
            ResponseHelper::error("Failed to record payment", 500);
        }
    }

    public function approve($id)
    {
        $updated = $this->paymentModel->updateStatus($id, 'paid');
        if ($updated) {
            ResponseHelper::success([], "Payment approved");
        } else {
            ResponseHelper::error("Failed to approve payment", 500);
        }
    }

    public function reject($id)
    {
        $updated = $this->paymentModel->updateStatus($id, 'failed');
        if ($updated) {
            ResponseHelper::success([], "Payment rejected");
        } else {
            ResponseHelper::error("Failed to reject payment", 500);
        }
    }

    public function getByBookingId($bookingId)
    {
        if (!$bookingId) {
            ResponseHelper::error("Missing booking ID", 400);
            return;
        }

        $payment = $this->paymentModel->getLatestPaymentByBookingId($bookingId);

        if ($payment) {
            ResponseHelper::success($payment);
        } else {
            ResponseHelper::success([], "No payment found for this booking");
        }
    }

    
}
