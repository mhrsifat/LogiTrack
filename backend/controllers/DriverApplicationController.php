<?php
require_once __DIR__ . "/../models/User.php";
require_once __DIR__ . "/../models/VehicleDocument.php";
require_once __DIR__ . "/../core/ResponseHelper.php";

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
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
      ResponseHelper::error("Invalid request method", 405);
      return;
    }

    // Get inputs from multipart/form-data
    $name = $_POST["name"] ?? null;
    $username = $_POST["username"] ?? null;
    $email = $_POST["email"] ?? null;
    $phone = $_POST["phone"] ?? null;
    $password = $_POST["password"] ?? null;
    $vehicleType = $_POST["vehicle_type"] ?? null;
    $experience = $_POST["experience"] ?? null;
    $documents = $_FILES["documents"] ?? null;

    // Basic validation
    if (
      !$name ||
      !$username ||
      !$email ||
      !$phone ||
      !$password ||
      !$vehicleType ||
      !$experience ||
      !$documents
    ) {
      ResponseHelper::error("Missing required fields");
      return;
    }

    // Check for duplicates
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

    // Generate 6-digit email verification token
    $emailToken = random_int(100000, 999999);
    $tokenExpires = date("Y-m-d H:i:s", strtotime("+1 hour"));

    // Hash password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // Prepare user data
    $userData = [
      "name" => $name,
      "username" => $username,
      "email" => $email,
      "phone" => $phone,
      "password" => $passwordHash,
      "role" => "driver",
      "email_verification_token" => $emailToken,
      "email_verification_expires" => $tokenExpires,
      "email_verified" => 0,
      "status" => "unverified",
      "created_at" => date("Y-m-d H:i:s"),
    ];

    try {
      // Start transaction
      $this->pdo->beginTransaction();

      // Create user
      $driverId = $this->userModel->createdriver($userData);
      if (!$driverId) {
        $this->pdo->rollBack();
        ResponseHelper::error("Failed to create user");
        return;
      }

      // Upload documents
      $uploadResult = $this->vehicleDocumentModel->uploadDocuments(
        $driverId,
        $vehicleType,
        $documents
      );
      if (!$uploadResult["status"]) {
        $this->pdo->rollBack();
        ResponseHelper::error(
          "Document upload failed: " . implode(", ", $uploadResult["errors"])
        );
        return;
      }

      // Send verification email
      $verifyUrl = $_ENV["Frontend_URL"] . "/verify-email?token=" . $emailToken;
      $subject = "Verify your email address";
      $message = "Hi $name,\n\nPlease verify your email by clicking this link: $verifyUrl\n\nThank you.";

      Mailer::send($email, $subject, nl2br($message));

      // Commit transaction
      $this->pdo->commit();

      ResponseHelper::success(
        "Driver registration and application successful. Please check your email to verify your account."
      );
    } catch (Exception $e) {
      $this->pdo->rollBack();
      ResponseHelper::error("Something went wrong: " . $e->getMessage());
    }
  }
}
