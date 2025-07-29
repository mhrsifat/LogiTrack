<?php

require_once __DIR__ . '/../config/database.php';

class Rating
{
  private $pdo;
  private $table = "ratings";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function getAll()
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->pdo->prepare("
      INSERT INTO {$this->table} (user_id, driver_id, booking_id, rating, comment, created_at)
      VALUES (:user_id, :driver_id, :booking_id, :rating, :comment, NOW())
    ");

    return $stmt->execute([
      ':user_id' => $data['user_id'],
      ':driver_id' => $data['driver_id'],
      ':booking_id' => $data['booking_id'],
      ':rating' => $data['rating'],
      ':comment' => $data['comment'] ?? null
    ]);
  }
}