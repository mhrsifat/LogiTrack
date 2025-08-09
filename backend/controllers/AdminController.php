<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class AdminController
{
  private $pdo;

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  // GET /admin/dashboard
  public function dashboard()
  {
    if (!AccessControl::requireRole(['admin'])) {
      return ResponseHelper::unauthorized("Only admins can access dashboard.");
    }

    try {
      $data = [];

      // Total users
      $data['total_users'] = $this->countTable('users');

      // Total drivers
      $data['total_drivers'] = $this->countTable('users', "role = 'driver'");

      // Total bookings
      $data['total_bookings'] = $this->countTable('bookings');

      // Total revenue (paid payments)
      $stmt = $this->pdo->prepare("SELECT SUM(amount) AS total FROM payments");
      $stmt->execute();
      $data['total_revenue'] = (float)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

      // Total vehicles
      $data['total_vehicles'] = $this->countTable('vehicles');

      // Bookings today
      $stmt = $this->pdo->prepare("
        SELECT COUNT(*) AS total FROM bookings 
        WHERE DATE(created_at) = CURDATE()
      ");
      $stmt->execute();
      $data['bookings_today'] = (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

      return ResponseHelper::success($data);
    } catch (Exception $e) {
      return ResponseHelper::error("Dashboard fetch failed: " . $e->getMessage());
    }
  }

  private function countTable($table, $where = null)
  {
    $query = "SELECT COUNT(*) as total FROM {$table}";
    if ($where) {
      $query .= " WHERE {$where}";
    }

    $stmt = $this->pdo->prepare($query);
    $stmt->execute();
    return (int)($stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
  }
}