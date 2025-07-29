<?php

require_once __DIR__ . "/../models/SupportTicket.php";
require_once __DIR__ . "/../helpers/ResponseHelper.php";
require_once __DIR__ . "/../core/AccessControl.php";

class SupportTicketController
{
  private $ticketModel;

  public function __construct()
  {
    $this->ticketModel = new SupportTicket();
  }

  // GET /support-tickets
  public function index()
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION["user_id"];
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

    $userId = $_SESSION["user_id"];
    $role = $_SESSION["role"];

    $ticket = $this->ticketModel->getById($id, $userId, $role);

    if (!$ticket) {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }

    return ResponseHelper::success($ticket);
  }

  // POST /support-tickets
  public function store()
  {
    if (!AccessControl::requireRole(["user"])) {
      return ResponseHelper::unauthorized("Only users can create tickets.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (empty($input["subject"]) || empty($input["message"])) {
      return ResponseHelper::badRequest("Subject and message are required.");
    }

    $data = [
      "user_id" => $_SESSION["user_id"],
      "subject" => trim($input["subject"]),
      "message" => trim($input["message"]),
    ];

    $success = $this->ticketModel->create($data);
    if ($success) {
      return ResponseHelper::success("Support ticket created.");
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

    $userId = $_SESSION["user_id"];
    $role = $_SESSION["role"];

    $data = [
      "subject" => trim($input["subject"]),
      "message" => trim($input["message"]),
      "status" => trim($input["status"]),
    ];

    $success = $this->ticketModel->update($id, $userId, $role, $data);
    if ($success) {
      return ResponseHelper::success("Support ticket updated.");
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

    $userId = $_SESSION["user_id"];
    $role = $_SESSION["role"];

    $success = $this->ticketModel->delete($id, $userId, $role);
    if ($success) {
      return ResponseHelper::success("Support ticket deleted.");
    } else {
      return ResponseHelper::notFound("Ticket not found or access denied.");
    }
  }
}
