<?php

require_once __DIR__ . "/../models/SupportTicket.php";
require_once __DIR__ . "/../models/SupportMessage.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/AccessControl.php";

class SupportTicketController
{
  private $ticketModel;
  private $messageModel;

  public function __construct()
  {
    $this->ticketModel = new SupportTicket();
    $this->messageModel = new SupportMessage();
  }

  // GET /support-tickets
  public function index()
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION["userId"];
    $role = $_SESSION["role"];

    $tickets = $this->ticketModel->getAll($userId, $role);
    return ResponseHelper::success($tickets);
  }

  // GET /support-tickets/{id}
  public function show($id)
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION["userId"];
    $role = $_SESSION["role"];

    $ticket = $this->ticketModel->getById($id, $userId, $role);

    if (!$ticket) {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }

    return ResponseHelper::success($ticket);
  }

  // POST /support-tickets
  // POST /support-tickets
public function store()
{
  if (!AccessControl::requireRole(["user", "driver"])) {
    return ResponseHelper::unauthorized("Only users can create tickets.");
  }

  $input = json_decode(file_get_contents("php://input"), true);

  if (empty($input["subject"]) || empty($input["description"])) {
    return ResponseHelper::badRequest("Subject and description are required.");
  }

  $data = [
    "user_id"     => $_SESSION["userId"],
    "subject"     => trim($input["subject"]),
    "description" => trim($input["description"]),
    "priority"    => $input["priority"] ?? "medium"
  ];

  $success = $this->ticketModel->create($data);
  if ($success) {
    return ResponseHelper::success([], "Support ticket created.");
  } else {
    return ResponseHelper::error("Failed to create ticket.");
  }
}


  // PUT /support-tickets/{id}
  public function update($id)
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (
      empty($input["subject"]) ||
      empty($input["message"]) ||
      empty($input["status"])
    ) {
      return ResponseHelper::badRequest(
        "Subject, message, and status are required."
      );
    }

    $userId = $_SESSION["userId"];
    $role = $_SESSION["role"];

    $data = [
      "subject" => trim($input["subject"]),
      "message" => trim($input["message"]),
      "status" => trim($input["status"]),
    ];

    $success = $this->ticketModel->update($id, $userId, $role, $data);
    if ($success) {
      return ResponseHelper::success([], "Support ticket updated.");
    } else {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }
  }

  // DELETE /support-tickets/{id}
  public function destroy($id)
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION["userId"];
    $role = $_SESSION["role"];

    $success = $this->ticketModel->delete($id, $userId, $role);
    if ($success) {
      return ResponseHelper::success([], "Support ticket deleted.");
    } else {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }
  }

  public function updateForAdmin()
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    $userId = $_SESSION["userId"];
    $role = $_SESSION["role"];
    $id = $input["id"] ?? null;
    $newStatus = $input["status"] ?? null;

    if ($id && !is_numeric($id)) {
      return ResponseHelper::badRequest("Invalid ticket ID.");
    }
    if ($role !== 'admin') {
      return ResponseHelper::unauthorized("Only admins can update tickets.");
    }
    if (!$id || !$newStatus) {
      return ResponseHelper::badRequest("Ticket ID and new status are required.");
    }

    $success = $this->ticketModel->updateStatus($id, $newStatus);
    if ($success) {
      return ResponseHelper::success([], "Support ticket updated.");
    } else {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }
  }





  public function getMessages($ticketId) {
  if (!AccessControl::isLoggedIn()) {
    return ResponseHelper::unauthorized("Login required");
  }
  // optional: check ownership or admin
  $msgs = $this->messageModel->getByTicket($ticketId);
  return ResponseHelper::success($msgs);
}

public function postMessage($ticketId) {
  if (!AccessControl::isLoggedIn()) {
    return ResponseHelper::unauthorized("Login required");
  }
  $input = json_decode(file_get_contents("php://input"), true);
  $msg = trim($input['message'] ?? "");
  if (!$msg) {
    return ResponseHelper::badRequest("Message cannot be empty");
  }

  $userId   = $_SESSION['userId'];
  $role     = $_SESSION['role']; // 'user' or 'admin'
  $created  = $this->messageModel->create($ticketId, $userId, $role, $msg);
  if ($created) {
    return ResponseHelper::success([], "Message sent");
  } else {
    return ResponseHelper::error("Failed to send message");
  }
}

}


