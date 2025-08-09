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

  // get all for user
  public function getByUser($userId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = :uid ORDER BY created_at DESC");
    $stmt->execute([':uid' => $userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // count unread
  public function getUnreadCount($userId)
  {
    $stmt = $this->pdo->prepare(
      "SELECT COUNT(*) AS cnt FROM {$this->table} 
       WHERE user_id = :uid AND is_read = 0"
    );
    $stmt->execute([':uid' => $userId]);
    return (int)$stmt->fetch(PDO::FETCH_ASSOC)['cnt'];
  }

  // mark single as read
  public function markAsRead($id, $userId)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE {$this->table} SET is_read = 1 
       WHERE id = :id AND user_id = :uid"
    );
    return $stmt->execute([':id'=>$id, ':uid'=>$userId]);
  }

  // mark all as read
  public function markAllAsRead($userId)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE {$this->table} SET is_read = 1 
       WHERE user_id = :uid"
    );
    return $stmt->execute([':uid'=>$userId]);
  }

  // create a new notification
  public function create($userId, $type, $title, $message)
  {
    $stmt = $this->pdo->prepare(
      "INSERT INTO {$this->table} 
       (user_id, type, title, message) 
       VALUES (:uid,:type,:title,:msg)"
    );
    return $stmt->execute([
      ':uid'   => $userId,
      ':type'  => $type,
      ':title' => $title,
      ':msg'   => $message
    ]);
  }
}
