<?php

require_once __DIR__ . '/../config/database.php';

class Notification
{
  private $pdo;
  private $table = "notifications";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function getByUser($userId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC");
    $stmt->execute([':user_id' => $userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function markAsRead($id, $userId)
  {
    $stmt = $this->pdo->prepare("UPDATE {$this->table} SET is_read = 1 WHERE id = :id AND user_id = :user_id");
    return $stmt->execute([
      ':id' => $id,
      ':user_id' => $userId
    ]);
  }
}