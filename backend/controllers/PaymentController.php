<?php

require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';

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
            ResponseHelper::success("Payment recorded successfully", 201);
        } else {
            ResponseHelper::error("Failed to record payment", 500);
        }
    }
}