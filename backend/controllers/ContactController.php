<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/Mailer.php";
require_once __DIR__ . "/../core/AccessControl.php";
require_once __DIR__ . "/../models/Contact.php";

class ContactController
{
  private $contactModel;

  public function __construct()
  {
    $this->contactModel = new Contact();
  }

  public function sendEmail()
  {
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'];
    $email = $data['email'];
    $subject = $data['subject'];
    $message = $data['message'];
    $created_at = date('Y-m-d H:i:s');

    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
      ResponseHelper::validationError("All fields are required.");
      return;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      ResponseHelper::validationError("Invalid email address.");
      return;
    }


    $this->contactModel->store($name, $email, $subject, $message, $created_at);
    try {
      $mail_sended = Mailer::send(
        $_ENV['Admin_Email'],
        "A new contact message from $name",
        "<p><strong>Name:</strong> $name</p>
         <p><strong>Email:</strong> $email</p>
         <p><strong>Subject:</strong> $subject</p>
         <p><strong>Message:</strong> $message</p>
         <p><strong>Sent at:</strong> $created_at</p>"
      );
      if ($mail_sended) {
        // Send a confirmation email to the user
        $sub = "Thank you for contacting us";
        $emailContent = "<p>Dear $name,</p>
                       <p>Thank you for reaching out to us. We have received your message and will get back to you shortly.</p>
                       <p>Best regards,<br>LogiTrack Team</p>";
        Mailer::send($email, $sub, $emailContent);
        ResponseHelper::success([], "Email sent successfully");
      }
    } catch (Exception $e) {
      ResponseHelper::error("Failed to send email: " . $e->getMessage(), 500);
      return;
    }
  }

  public function viewLogs()
  {
    $logFile = __DIR__ . '/../logs/errormail.log';

    if (file_exists($logFile)) {
      $content = file_get_contents($logFile);
      ResponseHelper::success(['logs' => nl2br(htmlspecialchars($content))]);
    } else {
      ResponseHelper::error("Log file not found", 404);
    }
  }

  public function listMessages() {
    AccessControl::requireRole(['admin']);
    try{
      $data = $this->contactModel->list();
      ResponseHelper::success($data);
    }
    catch (Exception $e) {
      ResponseHelper::error();
    }

  }
}
