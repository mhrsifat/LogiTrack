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

  public function listMessages()
  {
    AccessControl::requireRole(['admin']);
    try {
      $data = $this->contactModel->list();
      ResponseHelper::success($data);
    } catch (Exception $e) {
      ResponseHelper::error();
    }
  }

  // ContactController.php (preferred)
  public function markRead($id = null)
  {
    AccessControl::requireRole(['admin']);

    $id = intval($id);
    if ($id <= 0) {
      ResponseHelper::validationError("Invalid message id.");
      return;
    }

    try {
      $ok = $this->contactModel->updateReadStatus($id, 1);
      if ($ok) ResponseHelper::success([], "Message marked as read");
      else ResponseHelper::error("Failed to mark message as read", 500);
    } catch (Exception $e) {
      ResponseHelper::error("Error: " . $e->getMessage(), 500);
    }
  }

  public function markUnread($id = null)
  {
    AccessControl::requireRole(['admin']);

    $id = intval($id);
    if ($id <= 0) {
      ResponseHelper::validationError("Invalid message id.");
      return;
    }

    try {
      $ok = $this->contactModel->updateReadStatus($id, 0);
      if ($ok) ResponseHelper::success([], "Message marked as unread");
      else ResponseHelper::error("Failed to mark message as unread", 500);
    } catch (Exception $e) {
      ResponseHelper::error("Error: " . $e->getMessage(), 500);
    }
  }

  public function deleteMessage($id = null)
  {
    AccessControl::requireRole(['admin']); // only admins

    $id = intval($id);
    if ($id <= 0) {
      ResponseHelper::validationError("Invalid message id.");
      return;
    }

    try {
      // optional: check if message exists first
      $msg = $this->contactModel->find($id);
      if (!$msg) {
        ResponseHelper::notFound("Message not found.");
        return;
      }

      $ok = $this->contactModel->deleteById($id);
      if ($ok) {
        ResponseHelper::success([], "Message deleted successfully");
      } else {
        ResponseHelper::error("Failed to delete message", 500);
      }
    } catch (Exception $e) {
      ResponseHelper::error("Error: " . $e->getMessage(), 500);
    }
  }

  public function sendReply()
  {
    AccessControl::requireRole(['admin']);

    $data = json_decode(file_get_contents("php://input"), true);

    $to        = trim($data['to'] ?? '');
    $subject   = trim($data['subject'] ?? '');
    $message   = trim($data['message'] ?? '');
    $messageId = isset($data['message_id']) ? intval($data['message_id']) : null;

    if (empty($to) || empty($subject) || empty($message)) {
      ResponseHelper::validationError("All fields (to, subject, message) are required.");
      return;
    }
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
      ResponseHelper::validationError("Invalid recipient email address.");
      return;
    }

    $injectPattern = '/(\r|\n|%0A|%0D|bcc:|cc:|to:)/i';
    if (preg_match($injectPattern, $to) || preg_match($injectPattern, $subject) || preg_match($injectPattern, $message)) {
      ResponseHelper::validationError("Invalid characters in input.");
      return;
    }
    $html = "<p>" . nl2br(htmlspecialchars($message)) . "</p>
           <hr><p>Best regards,<br>LogiTrack Team</p>";

    try {
      $sent = Mailer::send($to, $subject, $html);
      if (!$sent) {
        ResponseHelper::error("Failed to send reply email.", 500);
        return;
      }

      $replier_id = $_SESSION['userId'] ?? 1;

      if ($messageId && $messageId > 0) {
        try {
          if (method_exists($this->contactModel, 'markReplied')) {
            $this->contactModel->markReplied($messageId, $replier_id);
          }
        } catch (Exception $e) {
          error_log("markReplied failed for id={$messageId}: " . $e->getMessage());
        }
      }
      ResponseHelper::success([], "Reply sent successfully");
    } catch (Exception $e) {
      ResponseHelper::error("Error sending reply: " . $e->getMessage(), 500);
    }
  }
}
