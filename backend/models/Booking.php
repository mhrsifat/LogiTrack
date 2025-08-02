<?php
require_once __DIR__ . "/../config/database.php";

class Booking
{
  private $pdo;
  private $table = "bookings";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  // 🔹 Admin: all bookings
  public function getAll()
  {
    $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY created_at DESC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 🔹 User: own bookings
  public function getByUser($userId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 🔹 Driver: pending bookings not yet confirmed
  public function getAvailableForDriver()
  {
    $stmt = $this->pdo->prepare("
      SELECT * FROM {$this->table}
      WHERE status = 'pending' AND selected_offer_id IS NULL
      ORDER BY scheduled_time ASC
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  // 🔍 Single booking
  public function getById($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  // 🆕 Create booking (user posts gig request)
  public function create($data)
  {
    $stmt = $this->pdo->prepare("
      INSERT INTO {$this->table} (user_id, pickup_address, drop_address, scheduled_time, vehicle_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    ");

    return $stmt->execute([
      $data["user_id"],
      $data["pickup_address"],
      $data["drop_address"],
      $data["scheduled_time"],
      $data["vehicle_type"] ?? null,
      $data["status"] ?? 'pending'
    ]);
  }

  // ✏️ Update booking
  public function update($id, $data)
  {
    $stmt = $this->pdo->prepare("
      UPDATE {$this->table}
      SET pickup_address = ?, drop_address = ?, scheduled_time = ?, status = ?
      WHERE id = ?
    ");

    return $stmt->execute([
      $data["pickup_address"] ?? '',
      $data["drop_address"] ?? '',
      $data["scheduled_time"] ?? '',
      $data["status"] ?? 'pending',
      $id,
    ]);
  }

  // ❌ Delete booking
  public function delete($id)
  {
    $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
    return $stmt->execute([$id]);
  }
}