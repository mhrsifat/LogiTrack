<?php
require_once __DIR__ . "/../config/database.php";

class Contact
{
  private $pdo;
  private $table;

  public function  __construct()
  {
    $this->pdo = connectDB();
    $this->table = 'contact';
  }

  public function store($name, $email, $subject, $message, $created_at)
  {
    $this->pdo->beginTransaction();
    try {
      $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?)");
      $stmt->execute([$name, $email, $subject, $message, $created_at]);
      //commit transaction
      $this->pdo->commit();
      return true;
    } catch (Exception $e) {
      $this->pdo->rollBack();
      // store in log file(errormail.log)
      error_log("Error storing contact: " . $e->getMessage(), 3, __DIR__ . '/../logs/errormail.log');
      // also store mail in log file
      $logMessage = "Name: $name, Email: $email, Subject: $subject, Message: $message, Created At: $created_at\n";
      file_put_contents(__DIR__ . '/../logs/errormail.log', $logMessage, FILE_APPEND);
      throw new Exception("Failed to store contact: " . $e->getMessage());
      return false;
    }
  }

  public function list()
  {
    $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY id DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function updateReadStatus($id, $is_read = 1)
  {
    $sql = "UPDATE {$this->table} SET is_read = :is_read WHERE id = :id";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
      ':is_read' => $is_read ? 1 : 0,
      ':id'      => $id
    ]);
  }

  public function find($id)
  {
    $sql = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function deleteById($id)
  {
    $sql = "DELETE FROM {$this->table} WHERE id = :id";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([':id' => $id]);
  }

  public function markReplied($message_id, $replier_id)
  {
    $sql = "UPDATE `{$this->table}` SET replied_id = :replier_id, replied_at = NOW() WHERE id = :message_id LIMIT 1";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
      ':replier_id'  => $replier_id,
      ':message_id'  => $message_id
    ]);
  }
}
