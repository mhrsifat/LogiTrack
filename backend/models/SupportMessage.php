<?php
require_once __DIR__ . "/../config/database.php";

class SupportMessage {
  private $pdo;
  private $table = "support_ticket_messages";

  public function __construct() {
    $this->pdo = connectDB();
  }

  public function getByTicket($ticketId) {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE ticket_id = ? ORDER BY created_at ASC");
    $stmt->execute([$ticketId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function create($ticketId, $senderId, $senderRole, $message) {
    $stmt = $this->pdo->prepare("
      INSERT INTO {$this->table} (ticket_id, sender_id, sender_role, message) 
      VALUES (?, ?, ?, ?)
    ");
    return $stmt->execute([$ticketId, $senderId, $senderRole, $message]);
  }
}
