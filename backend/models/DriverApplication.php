<?php
require_once __DIR__ . "/../config/database.php";

class DriverApplication
{
    private $pdo;
    private $table = "driver_applications";

    public function __construct()
    {
        $this->pdo = connectDB();
    }

    public function create($data)
    {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (user_id, vehicle_type, experience_years, status, created_at) VALUES (:user_id, :vehicle_type, :experience_years, :status, :created_at)");
        $success = $stmt->execute([
            'user_id' => $data['user_id'],
            'vehicle_type' => $data['vehicle_type'],
            'experience_years' => $data['experience_years'],
            'status' => $data['status'],
            'created_at' => $data['created_at']
        ]);

        if ($success) {
            return $this->pdo->lastInsertId();
        }
        return false;
    }
}
