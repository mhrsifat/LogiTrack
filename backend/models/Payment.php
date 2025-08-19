<?php

require_once __DIR__ . "/../config/database.php";

class Payment
{
  private $pdo;
  private $table = "payments";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  // Get all payments
  public function getAllPayments()
  {
    $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY created_at DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // Create a new payment
  public function createPayment($data)
  {
    $sql = "
      INSERT INTO {$this->table} 
        (booking_id, amount, method, status, transaction_id, paid_at, created_at)
      VALUES 
        (:booking_id, :amount, :method, :status, :transaction_id, :paid_at, NOW())
    ";

    $stmt = $this->pdo->prepare($sql);

    $stmt->execute([
      ':booking_id'     => $data['booking_id'],
      ':amount'         => $data['amount'],
      ':method'         => $data['method'],
      ':status'         => $data['status'] ?? 'pending',
      ':transaction_id' => $data['transaction_id'] ?? null,
      ':paid_at'        => $data['paid_at'] ?? null,
    ]);
    return $this->pdo->lastInsertId();
  }
}