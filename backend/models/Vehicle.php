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
        $stmt = $this->pdo->query("SELECT * FROM {$this->table}");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getByUserId($userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = ? AND status = 'approved'");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data, $userId, $submit_id)
    {
        $stmt = $this->pdo->prepare(
            "INSERT INTO {$this->table} (user_id, type, license_plate, capacity_kg, photo_url, submit_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            $userId,
            $data["type"],
            $data["license_plate"],
            $data["capacity_kg"] ?? null,
            $data["photo_url"] ?? null,
            $submit_id ?? null,
            $data["status"] ?? 'pending'
        ]);

        $data["id"] = $this->pdo->lastInsertId();
        return $data;
    }

    public function update($id, $data)
    {
        $stmt = $this->pdo->prepare(
            "UPDATE {$this->table}
         SET type = ?, license_plate = ?, capacity_kg = ?, photo_url = ?, status = ?
         WHERE id = ?"
        );

        return $stmt->execute([
            $data["type"],
            $data["license_plate"],
            $data["capacity_kg"] ?? null,
            $data["photo_url"] ?? null,
            $data["status"],
            $id
        ]);
    }


    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getByUserIdForExistCheck($userId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
