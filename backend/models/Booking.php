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

  // In Booking.php model class, add this method:

  public function getConfirmedOffer($bookingId)
  {
    $sql = "SELECT bo.id, bo.offered_price AS price, bo.message, u.name AS driver_name, u.id AS driver_id
            FROM booking_offers bo
            JOIN users u ON bo.driver_id = u.id
            WHERE bo.booking_id = ? AND bo.status = 'accepted'
            LIMIT 1";

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([$bookingId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
  }

  // 🔍 Single booking
  public function getById($id)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM bookings WHERE id = ?");
    $stmt->execute([$id]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($booking) {
      // Attach confirmed offer info if exists
      $confirmedOffer = $this->getConfirmedOffer($id);
      if ($confirmedOffer) {
        $booking['confirmed_offer'] = $confirmedOffer;
      } else {
        $booking['confirmed_offer'] = null;
      }
    }

    return $booking;
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

  public function createOffer($booking_id, $driver_id, $offered_price, $message = null)
  {
    $sql = "INSERT INTO booking_offers (`booking_id`, `driver_id`, `offered_price`, `message`)
            VALUES (:booking_id, :driver_id, :offered_price, :message)";
    $stmt = $this->pdo->prepare($sql);
    return $stmt->execute([
      ":booking_id" => $booking_id,
      ":driver_id" => $driver_id,
      ":offered_price" => $offered_price,
      ":message" => $message
    ]);
  }

  public function getOffersByBookingId($booking_id)
  {
    $sql = "SELECT * FROM booking_offers WHERE booking_id = :booking_id ORDER BY created_at DESC";
    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([':booking_id' => $booking_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function getOffersByDriver($driverId)
{
    $sql = "SELECT o.*, b.pickup_address, b.drop_address, b.scheduled_time, b.status AS booking_status
            FROM booking_offers o
            JOIN bookings b ON o.booking_id = b.id
            WHERE o.driver_id = ?
            ORDER BY o.created_at DESC";

    $stmt = $this->pdo->prepare($sql);
    $stmt->execute([$driverId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

}
