<?php

require_once __DIR__ . '/../config/database.php';

class PriceRate
{
  private $pdo;
  private $table = "price_rates";

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
      INSERT INTO {$this->table} (vehicle_type, base_fare, per_km_rate, route_name, created_at)
      VALUES (:vehicle_type, :base_fare, :per_km_rate, :route_name, NOW())
    ");
    return $stmt->execute([
      ':vehicle_type' => $data['vehicle_type'],
      ':base_fare' => $data['base_fare'],
      ':per_km_rate' => $data['per_km_rate'],
      ':route_name' => $data['route_name']
    ]);
  }

  public function update($id, $data)
  {
    $stmt = $this->pdo->prepare("
      UPDATE {$this->table}
      SET vehicle_type = :vehicle_type, base_fare = :base_fare,
          per_km_rate = :per_km_rate, route_name = :route_name
      WHERE id = :id
    ");
    return $stmt->execute([
      ':vehicle_type' => $data['vehicle_type'],
      ':base_fare' => $data['base_fare'],
      ':per_km_rate' => $data['per_km_rate'],
      ':route_name' => $data['route_name'],
      ':id' => $id
    ]);
  }

  public function delete($id)
  {
    $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
    return $stmt->execute([':id' => $id]);
  }
}