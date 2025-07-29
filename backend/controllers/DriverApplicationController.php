<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/VehicleDocument.php';
require_once __DIR__ . '/../core/ResponseHelper.php';

class DriverApplicationController
{
    private $userModel;
    private $vehicleDocumentModel;

    public function __construct()
    {
        $this->userModel = new User();
        $this->vehicleDocumentModel = new VehicleDocument();
    }

    public function applyDriver()
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            ResponseHelper::error("Invalid request method", 405);
            return;
        }

        // Because we are receiving multipart/form-data, use $_POST and $_FILES
        $name = $_POST['name'] ?? null;
        $username = $_POST['username'] ?? null;
        $email = $_POST['email'] ?? null;
        $phone = $_POST['phone'] ?? null;
        $password = $_POST['password'] ?? null;
        $vehicleType = $_POST['vehicle_type'] ?? null;
        $experience = $_POST['experience'] ?? null;
        $documents = $_FILES['documents'] ?? null;

        // Basic validation
        if (!$name || !$username || !$email || !$phone || !$password || !$vehicleType || !$experience || !$documents) {
            ResponseHelper::error("Missing required fields");
            return;
        }

        // Check if username or phone or email already exist
        if ($this->userModel->existsByUsername($username)) {
            ResponseHelper::error("Username already exists");
            return;
        }
        if ($this->userModel->existsByEmail($email)) {
            ResponseHelper::error("Email already exists");
            return;
        }
        if ($this->userModel->existsByPhone($phone)) {
            ResponseHelper::error("Phone number already exists");
            return;
        }

        // Hash password securely
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Prepare user data
        $userData = [
            'name' => $name,
            'username' => $username,
            'email' => $email,
            'phone' => $phone,
            'password' => $passwordHash,
            'role' => 'driver',
            'email_verified' => 0,
            'status' => 'unverified',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        // Create user (driver)
        $driverId = $this->userModel->createdriver($userData);

        if (!$driverId) {
            ResponseHelper::error("Failed to create user");
            return;
        }

        // Save vehicle documents
        $uploadResult = $this->vehicleDocumentModel->uploadDocuments($driverId, $vehicleType, $documents);

        if (!$uploadResult['status']) {
            // If documents upload failed, optionally delete the created user or mark as incomplete
            ResponseHelper::error("Document upload failed: " . implode(", ", $uploadResult['errors']));
            return;
        }

        // Optionally save driving experience if needed (not saved in your schema yet)
        // You might want to add a column in users or a separate table for experience

        ResponseHelper::success("Driver registration and application successful");
    }
}
