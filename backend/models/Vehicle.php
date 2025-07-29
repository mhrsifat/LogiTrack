<?php
require_once __DIR__ . "/../config/database.php";

class Vehicle
{
  private $conn;

  public function __construct()
  {
    $db = new Database();
    $this->conn = $db->getConnection();
  }

  public function getAll()
  {
    $stmt = $this->conn->query("SELECT * FROM vehicles");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getById($id)
  {
    $stmt = $this->conn->prepare("SELECT * FROM vehicles WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->conn->prepare(
      "INSERT INTO vehicles (owner_id, vehicle_type, license_plate, capacity, status) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
      $data["owner_id"],
      $data["vehicle_type"],
      $data["license_plate"],
      $data["capacity"],
      $data["status"],
    ]);

    $data["id"] = $this->conn->lastInsertId();
    return $data;
  }

  public function update($id, $data)
  {
    $stmt = $this->conn->prepare(
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
    $stmt = $this->conn->prepare("DELETE FROM vehicles WHERE id = ?");
    return $stmt->execute([$id]);
  }
}
