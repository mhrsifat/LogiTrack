<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/Mailer.php";
require_once __DIR__ . "/../models/User.php";

class AuthController
{
  private $userModel;

  public function __construct()
  {
    $this->userModel = new User();
  }

  public function login()
  {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data["username"]) || empty($data["password"])) {
      return ResponseHelper::validationError([
        "username" => "Email or Username is required",
        "password" => "Password is required",
      ]);
    }

    $username = strtolower(trim($data["username"]));
    $password = trim($data["password"]);
    $remember = !empty($data["remember"]);

    $user = $this->userModel->findByEmailOrUsername($username);

    if (!$user || !password_verify($password, $user["password"])) {
      self::logout();
      return ResponseHelper::unauthorized("Invalid email or password");
    }

    if ($user["status"] == "unverified") {
      $_SESSION["loggedIn"] = false;
      $_SESSION["userId"] = $user["id"];
      return ResponseHelper::error("Please verify your email before logging in", 403);
    }

    $_SESSION["loggedIn"] = true;
    $_SESSION["userId"] = $user["id"];
    $_SESSION["role"] = $user["role"];

    if ($remember) {
      $rememberToken = bin2hex(random_bytes(32));

      setcookie("remember_token", $rememberToken, time() + (86400 * 30), "/", "", false, true);
      $userAgent = $_SERVER["HTTP_USER_AGENT"] ?? "unknown";
      $ipAddress = $_SERVER["REMOTE_ADDR"] ?? "0.0.0.0";

      $this->userModel->storeRememberToken(
        $user["id"],
        $rememberToken,
        $userAgent,
        $ipAddress
      );
    }

    return ResponseHelper::success([
      "user_id"  => $user["id"],
      "name"     => $user["name"],
      "username" => $user["username"],
      "email"    => $user["email"],
      "role"     => $user["role"],
    ], "Login successful", 200);
  }


  public function register()
  {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
      !isset(
        $data["name"],
        $data["username"],
        $data["email"],
        $data["phone"],
        $data["password"]
      )
    ) {
      ResponseHelper::validationError([
        "name" => "Name is required",
        "username" => "Username is required",
        "email" => "Email is required",
        "phone" => "Phone is required",
        "password" => "Password is required",
      ]);
    }

    $name = htmlspecialchars(trim($data["name"]));
    $username = htmlspecialchars(trim($data["username"]));
    $email = htmlspecialchars(trim($data["email"]));
    $phone = htmlspecialchars(trim($data["phone"]));
    $password = password_hash($data["password"], PASSWORD_BCRYPT);

    if ($this->userModel->findByEmailOrPhone($data["email"], $data["phone"])) {
      ResponseHelper::error("Email or Phone already in use", 409);
    }

    $user = $this->userModel->create(
      $name,
      $username,
      $email,
      $phone,
      $password
    );

    if (!$user) {
      ResponseHelper::error("Registration failed", 500);
    }

    $verifyUrl = $_ENV["Frontend_URL"] . "/verify-email?token=" . $user["token"];
    $subject = "Verify your email address";
    $message = "Hi $name,\n\nPlease verify your email by clicking this link: $verifyUrl\n\nThank you.";

    Mailer::send($email, $subject, nl2br($message));

    ResponseHelper::success(
      [
        "user_id" => $user["user_id"],
        "verify_url" => $verifyUrl,
      ],
      "User registered. Please verify your email.",
      201
    );
  }

  public function verifyEmail()
  {
    $token = $_GET["token"] ?? null;

    if (!$token) {
      ResponseHelper::error("Token is required", 400);
      return;
    }

    $user = $this->userModel->selectVerifyEmail($token);

    if (!$user) {
      ResponseHelper::error("Invalid token", 404);
      return;
    }

    if ($user["status"] !== "unverified") {
      ResponseHelper::success([], "Email already verified");
      return;
    }

    if ($this->userModel->updateUserVerify($user["id"])) {
      $_SESSION["loggedIn"] = true;
      $_SESSION["userId"] = $user["id"];
      $_SESSION["role"] = $user["role"];
      ResponseHelper::success([], "Email verified successfully");
    } else {
      ResponseHelper::error("Failed to verify email", 500);
    }
  }

  public function verifyEmailToken()
  {
    $data  = json_decode(file_get_contents("php://input"), true);
    $token = trim($data['token'] ?? '');

    if (!$token) {
      return ResponseHelper::error("Token is required", 400);
    }

    // lookup user purely by token + expiry, no session needed
    $user = $this->userModel->selectVerifyEmailToken($token);
    if (!$user) {
      return ResponseHelper::error("Invalid or expired token", 404);
    }

    if ($user['status'] !== 'unverified') {
      return ResponseHelper::success([], "Email already verified");
    }

    if ($this->userModel->updateUserVerify($user['id'])) {
      $_SESSION["loggedIn"] = true;
      $_SESSION["userId"] = $user["id"];
      $_SESSION["role"] = $user["role"];
      return ResponseHelper::success([], "Email verified successfully");
    }
    return ResponseHelper::error("Failed to verify email", 500);
  }

  function isEmailExist()
  {
    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data["email"]);
    $user = $this->userModel->findByEmailOrUsername($email);

    if (!$user) {
      ResponseHelper::success([], "Available");
    } else {
      ResponseHelper::error("Already a user exist with this email");
    }
  }

  function userExistFunction()
  {
    $data = json_decode(file_get_contents("php://input"), true);
    $username = $data["username"];
    $user = $this->userModel->findByEmailOrUsername($username);

    if (!$user) {
      ResponseHelper::success([], "Available");
    } else {
      ResponseHelper::error("username already taken");
    }
  }

  public function autologin()
  {
    if (isset($_SESSION["loggedIn"]) && isset($_SESSION["userId"]) && $_SESSION["loggedIn"] === true) {
      $user = $this->userModel->findById($_SESSION["userId"]);
      ResponseHelper::success([
      "user_id"  => $user["id"],
      "name"     => $user["name"],
      "username" => $user["username"],
      "email"    => $user["email"],
      "role"     => $user["role"],
    ], "Auto-login success");
    }

    if (!empty($_COOKIE["remember_token"])) {
      $token = $_COOKIE["remember_token"];
      $userAgent = $_SERVER["HTTP_USER_AGENT"];
      $ip = $_SERVER["REMOTE_ADDR"];

      $user = $this->userModel->findByToken($token, $userAgent, $ip);
      if ($user) {
        $_SESSION["loggedIn"] = true;
        $_SESSION["userId"] = $user["id"];
        $_SESSION["role"] = $user["role"];
        ResponseHelper::success([
      "user_id"  => $user["id"],
      "name"     => $user["name"],
      "username" => $user["username"],
      "email"    => $user["email"],
      "role"     => $user["role"],
    ],"Auto-login from token");
        return;
      } else {
        self::logout();
      }
    }
    $_SESSION = [];
    session_destroy();
    ResponseHelper::error("Not logged in", 200);
  }


  public function updateemail()
  {
    if (!isset($_SESSION["loggedIn"]) || $_SESSION["loggedIn"] !== true) {
      ResponseHelper::unauthorized("Unauthorized access");
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $newEmail = trim($data["email"] ?? "");

    if (!$newEmail || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
      ResponseHelper::validationError([
        "email" => "A valid email is required",
      ]);
    }

    $userId = $_SESSION["userId"];

    // 🔍 Get current user info
    $user = $this->userModel->findById($userId);

    if (!$user) {
      ResponseHelper::error("User not found", 404);
    }

    if ($user["status"] !== "unverified") {
      ResponseHelper::error("Email already verified. Cannot update.");
    }

    // 🚫 Check if new email is already taken
    $existing = $this->userModel->findByEmailOrPhone($newEmail, $newEmail);
    if ($existing && $existing["id"] !== $userId) {
      ResponseHelper::error("Email already in use", 409);
    }

    // ✅ Generate new verification token
    $token = bin2hex(random_bytes(32));
    $expires = date("Y-m-d H:i:s", time() + 3600); // 1 hour expiry

    // 🛠️ Update the user's email, token, and expiry
    $updated = $this->userModel->updateEmailAndToken(
      $userId,
      $newEmail,
      $token,
      $expires
    );

    if (!$updated) {
      ResponseHelper::error("Failed to update email", 500);
    }

    // ✉️ Send new verification email
    $verifyUrl = $_ENV["Frontend_URL"] . "/verify-email?token=$token";
    $subject = "Verify Your New Email Address";
    $message = "Hi {$user["name"]},\n\nPlease verify your new email by clicking this link: $verifyUrl\n\nThank you.";

    Mailer::send($newEmail, $subject, nl2br($message));

    ResponseHelper::success(
      [
        "verify_url" => $verifyUrl,
      ],
      "Email updated. Please check your inbox to verify."
    );
  }
  public function logout()
  {
    $token = $_COOKIE["remember_token"] ?? null;
    $userAgent = $_SERVER["HTTP_USER_AGENT"];
    $ip = $_SERVER["REMOTE_ADDR"];

    if ($token) {
      $this->userModel->logoutDevice($token, $userAgent, $ip);
      setcookie("remember_token", "", time() - 3600, "/");
    }
    $_SESSION = [];
    session_destroy();

    ResponseHelper::success([], "Logged out from current device", 401);
  }

  public function logoutFromAllDevices()
  {
    if (!isset($_SESSION["userId"])) {
      ResponseHelper::unauthorized("Not logged in");
      return;
    }

    $userId = $_SESSION["userId"];
    $this->userModel->removeAllRememberTokens($userId);

    setcookie("remember_token", "", time() - 3600, "/");
    $_SESSION = [];
    session_destroy();

    ResponseHelper::success([], "Logged out from all devices");
  }
}
