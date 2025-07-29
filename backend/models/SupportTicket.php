<?php

require_once __DIR__ . '/../config/database.php';

class SupportTicket
{
  private $pdo;
  private $table = "support_tickets";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  // List tickets based on user role
  public function getAll($userId, $role)
  {
    if ($role === 'admin') {
      // Admin sees all tickets
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
      $stmt->execute();
    } else {
      // Users see only their tickets
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = :user_id ORDER BY created_at DESC");
      $stmt->execute([':user_id' => $userId]);
    }
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getById($id, $userId, $role)
  {
    if ($role === 'admin') {
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
      $stmt->execute([':id' => $id]);
    } else {
      // User can only see own ticket
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id AND user_id = :user_id");
      $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->pdo->prepare("
      INSERT INTO {$this->table} (user_id, subject, message, status, created_at, updated_at)
      VALUES (:user_id, :subject, :message, 'open', NOW(), NOW())
    ");
    return $stmt->execute([
      ':user_id' => $data['user_id'],
      ':subject' => $data['subject'],
      ':message' => $data['message']
    ]);
  }

  public function update($id, $userId, $role, $data)
  {
    // Allow admins to update any ticket, users only their own
    if ($role === 'admin') {
      $stmt = $this->pdo->prepare("
        UPDATE {$this->table}
        SET subject = :subject, message = :message, status = :status, updated_at = NOW()
        WHERE id = :id
      ");
      return $stmt->execute([
        ':subject' => $data['subject'],
        ':message' => $data['message'],
        ':status' => $data['status'],
        ':id' => $id
      ]);
    } else {
      $stmt = $this->pdo->prepare("
        UPDATE {$this->table}
        SET subject = :subject, message = :message, status = :status, updated_at = NOW()
        WHERE id = :id AND user_id = :user_id
      ");
      return $stmt->execute([
        ':subject' => $data['subject'],
        ':message' => $data['message'],
        ':status' => $data['status'],
        ':id' => $id,
        ':user_id' => $userId
      ]);
    }
  }

  public function delete($id, $userId, $role)
  {
    if ($role === 'admin') {
      $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
      return $stmt->execute([':id' => $id]);
    } else {
      $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id AND user_id = :user_id");
      return $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }
  }
}