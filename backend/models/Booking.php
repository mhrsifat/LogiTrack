<?php
require_once __DIR__ . "/../config/database.php";

class Booking
{
  private $pdo;

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function getAll()
  {
    $stmt = $this->pdo->query("SELECT * FROM bookings");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getById($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $userid = $_SESSION['userId'];
    $stmt = $this->pdo->prepare(
      "INSERT INTO bookings (user_id, vehicle_id, pickup_address, drop_address, status, scheduled_time) VALUES (?, ?, ?, ?, ?, ?)"
    );
    return $stmt->execute([
      $userid,
      $data["vehicle_id"],
      $data["pickup_address"],
      $data["drop_address"],
      $data["status"],
      $data["scheduled_time"],
    ]);
  }

 public function update($id, $data)
{
  $stmt = $this->pdo->prepare(
    "UPDATE bookings SET 
      pickup_address = ?, 
      drop_address = ?, 
      scheduled_time = ?, 
      status = ? 
    WHERE id = ?"
  );

  return $stmt->execute([
    $data["pickup_address"] ?? '',
    $data["drop_address"] ?? '',
    $data["scheduled_time"] ?? '',
    $data["status"] ?? 'pending', 
    $id,
  ]);
}


  public function delete($id)
  {
    $stmt = $this->pdo->prepare("DELETE FROM bookings WHERE id = ?");
    return $stmt->execute([$id]);
  }
}
