<?php
require_once __DIR__ . "/../config/database.php";

class Vehicle
{
  private $pdo;

  private $table = "vehicles";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function getAll()
  {
    $stmt = $this->pdo->query("SELECT * FROM vehicles");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getById($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM vehicles WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function getByUserId($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM vehicles WHERE user_id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->pdo->prepare(
      "INSERT INTO vehicles (owner_id, vehicle_type, license_plate, capacity, status) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
      $data["owner_id"],
      $data["vehicle_type"],
      $data["license_plate"],
      $data["capacity"],
      $data["status"],
    ]);

    $data["id"] = $this->pdo->lastInsertId();
    return $data;
  }

  public function update($id, $data)
  {
    $stmt = $this->pdo->prepare(
      "UPDATE vehicles SET vehicle_type = ?, license_plate = ?, capacity = ?, status = ? WHERE id = ?"
    );
    return $stmt->execute([
      $data["vehicle_type"],
      $data["license_plate"],
      $data["capacity"],
      $data["status"],
      $id,
    ]);
  }

  public function delete($id)
  {
    $stmt = $this->pdo->prepare("DELETE FROM vehicles WHERE id = ?");
    return $stmt->execute([$id]);
  }
}
