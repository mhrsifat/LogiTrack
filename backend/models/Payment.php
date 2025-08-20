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
    $sql = "
        SELECT 
            p.id, p.booking_id, p.amount, p.status, p.created_at,
            u.name AS user_name,
            d.name AS driver_name
        FROM {$this->table} p
        JOIN bookings b ON p.booking_id = b.id
        JOIN users u ON b.user_id = u.id
        LEFT JOIN booking_offers bo ON b.selected_offer_id = bo.id
        LEFT JOIN users d ON bo.driver_id = d.id
        ORDER BY p.created_at DESC
    ";

    $stmt = $this->pdo->query($sql);
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

 public function updateStatus($id, $status)
{
    $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = :status WHERE id = :id");
    return $stmt->execute([
        ':status' => $status,
        ':id' => $id
    ]);
}

 // Returns the latest payment for a given booking
    public function getLatestPaymentByBookingId($bookingId)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM {$this->table} WHERE booking_id = :booking_id ORDER BY created_at DESC LIMIT 1"
        );
        $stmt->execute([':booking_id' => $bookingId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

}