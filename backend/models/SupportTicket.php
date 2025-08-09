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
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
      $stmt->execute();
    } else {
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
      $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id AND user_id = :user_id");
      $stmt->execute([':id' => $id, ':user_id' => $userId]);
    }
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

 public function create($data)
{
  $stmt = $this->pdo->prepare("
    INSERT INTO {$this->table} (user_id, subject, description, status, priority, assigned_to, created_at, updated_at)
    VALUES (:user_id, :subject, :description, 'open', :priority, :assigned_to, NOW(), NOW())
  ");
  return $stmt->execute([
    ':user_id'     => $data['user_id'],
    ':subject'     => $data['subject'],
    ':description' => $data['description'],
    ':priority'    => $data['priority'] ?? 'medium',
    ':assigned_to' => $data['assigned_to'] ?? null,
  ]);
}


  public function update($id, $userId, $role, $data)
  {
    if ($role === 'admin') {
      $stmt = $this->pdo->prepare("
        UPDATE {$this->table}
        SET subject = :subject, description = :description, status = :status, priority = :priority, assigned_to = :assigned_to, updated_at = NOW()
        WHERE id = :id
      ");
      return $stmt->execute([
        ':subject'     => $data['subject'],
        ':description' => $data['description'],
        ':status'      => $data['status'],
        ':priority'    => $data['priority'],
        ':assigned_to' => $data['assigned_to'],
        ':id'          => $id
      ]);
    } else {
      $stmt = $this->pdo->prepare("
        UPDATE {$this->table}
        SET subject = :subject, description = :description, status = :status, updated_at = NOW()
        WHERE id = :id AND user_id = :user_id
      ");
      return $stmt->execute([
        ':subject'     => $data['subject'],
        ':description' => $data['description'],
        ':status'      => $data['status'],
        ':id'          => $id,
        ':user_id'     => $userId
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

  public function updateStatus($id, $newStatus)
  {
    $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = :status, updated_at = NOW() WHERE id = :id");
    return $stmt->execute([':status' => $newStatus, ':id' => $id]);

  }
}
