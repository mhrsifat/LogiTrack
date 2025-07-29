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
    $stmt = $this->pdo->prepare(
      "INSERT INTO bookings (user_id, vehicle_id, pickup_location, dropoff_location, status, date) VALUES (?, ?, ?, ?, ?, ?)"
    );
    return $stmt->execute([
      $data["user_id"],
      $data["vehicle_id"],
      $data["pickup_location"],
      $data["dropoff_location"],
      $data["status"],
      $data["date"],
    ]);
  }

  public function update($id, $data)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE bookings SET vehicle_id = ?, pickup_location = ?, dropoff_location = ?, status = ?, date = ? WHERE id = ?"
    );
    return $stmt->execute([
      $data["vehicle_id"],
      $data["pickup_location"],
      $data["dropoff_location"],
      $data["status"],
      $data["date"],
      $id,
    ]);
  }

  public function delete($id)
  {
    $stmt = $this->pdo->prepare("DELETE FROM bookings WHERE id = ?");
    return $stmt->execute([$id]);
  }
}
