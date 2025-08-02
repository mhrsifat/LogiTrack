<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/ResponseHelper.php';

class BookingOfferController
{
  private $pdo;

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  // 🚚 Driver sends offer for a booking
  public function store()
  {
    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['booking_id']) || empty($data['driver_id']) || empty($data['offered_price'])) {
      return ResponseHelper::validationError("booking_id, driver_id, and offered_price are required.");
    }

    $stmt = $this->pdo->prepare("INSERT INTO booking_offers (booking_id, driver_id, offered_price, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([
      $data['booking_id'],
      $data['driver_id'],
      $data['offered_price'],
      $data['message'] ?? null
    ]);

    return ResponseHelper::success("Offer submitted successfully.");
  }

  // 📦 Get all offers for a specific booking
  public function getOffersByBooking($bookingId)
  {
    $stmt = $this->pdo->prepare("
      SELECT bo.*, u.name AS driver_name, u.phone, u.email
      FROM booking_offers bo
      JOIN users u ON bo.driver_id = u.id
      WHERE bo.booking_id = ?
    ");
    $stmt->execute([$bookingId]);
    $offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return ResponseHelper::success("Offers retrieved.", $offers);
  }

  // ✅ User accepts an offer (confirm booking)
  public function acceptOffer($offerId)
  {
    // 1. Get the offer first
    $stmt = $this->pdo->prepare("SELECT * FROM booking_offers WHERE id = ?");
    $stmt->execute([$offerId]);
    $offer = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$offer) {
      return ResponseHelper::notFound("Offer not found.");
    }

    $bookingId = $offer['booking_id'];

    // 2. Update booking: set selected_offer_id and status to confirmed
    $stmt = $this->pdo->prepare("UPDATE bookings SET selected_offer_id = ?, status = 'confirmed' WHERE id = ?");
    $stmt->execute([$offerId, $bookingId]);

    // 3. Update offer: accepted
    $stmt = $this->pdo->prepare("UPDATE booking_offers SET status = 'accepted' WHERE id = ?");
    $stmt->execute([$offerId]);

    // 4. Set all other offers for this booking to 'declined'
    $stmt = $this->pdo->prepare("UPDATE booking_offers SET status = 'declined' WHERE booking_id = ? AND id != ?");
    $stmt->execute([$bookingId, $offerId]);

    return ResponseHelper::success("Offer accepted. Booking confirmed.");
  }

  // ❌ User declines a specific offer (optional)
  public function declineOffer($offerId)
  {
    $stmt = $this->pdo->prepare("UPDATE booking_offers SET status = 'declined' WHERE id = ?");
    $stmt->execute([$offerId]);

    return ResponseHelper::success("Offer declined.");
  }
}