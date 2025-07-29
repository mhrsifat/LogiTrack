<?php

require_once __DIR__ . '/../config/database.php';

class Gig
{
  private $pdo;
  private $table = "gigs";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function all()
  {
    $stmt = $this->pdo->query("SELECT * FROM {$this->table} ORDER BY available_from ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->pdo->prepare("INSERT INTO {$this->table} 
      (driver_id, vehicle_id, pickup_location, dropoff_location, vehicle_type, price, available_from) 
      VALUES (:driver_id, :vehicle_id, :pickup_location, :dropoff_location, :vehicle_type, :price, :available_from)");

    return $stmt->execute([
      ':driver_id' => $data['driver_id'],
      ':vehicle_id' => $data['vehicle_id'],
      ':pickup_location' => $data['pickup_location'],
      ':dropoff_location' => $data['dropoff_location'],
      ':vehicle_type' => $data['vehicle_type'],
      ':price' => $data['price'],
      ':available_from' => $data['available_from'],
    ]);
  }

  public function find($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }
}
