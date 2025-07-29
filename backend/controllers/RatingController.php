<?php

require_once __DIR__ . '/../models/Rating.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class RatingController
{
  private $ratingModel;

  public function __construct()
  {
    $this->ratingModel = new Rating();
  }

  // GET /ratings
  public function index()
  {
    if (!AccessControl::requireRole(['admin', 'operator'])) {
      return ResponseHelper::unauthorized("Access denied.");
    }

    $ratings = $this->ratingModel->getAll();
    return ResponseHelper::success($ratings);
  }

  // POST /ratings
  public function store()
  {
    if (!AccessControl::requireRole(['user'])) {
      return ResponseHelper::unauthorized("Only users can submit ratings.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (
      !isset($input['user_id'], $input['driver_id'], $input['booking_id'], $input['rating']) ||
      $input['rating'] < 1 || $input['rating'] > 5
    ) {
      return ResponseHelper::badRequest("Invalid rating input.");
    }

    $success = $this->ratingModel->create($input);
    if ($success) {
      return ResponseHelper::success("Rating submitted successfully.");
    } else {
      return ResponseHelper::error("Failed to save rating.");
    }
  }
}