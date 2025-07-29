<?php

require_once __DIR__ . '/../models/Gig.php';
require_once __DIR__ . '/../core/ResponseHelper.php';

class GigController
{
  private $gigModel;

  public function __construct()
  {
    $this->gigModel = new Gig();
  }

  // GET /gigs
  public function index()
  {
    $gigs = $this->gigModel->all();
    ResponseHelper::success($gigs);
  }

  // POST /gigs
  public function store()
  {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
      empty($data['driver_id']) || empty($data['vehicle_id']) || empty($data['pickup_location']) ||
      empty($data['dropoff_location']) || empty($data['vehicle_type']) ||
      empty($data['price']) || empty($data['available_from'])
    ) {
      ResponseHelper::error("All fields are required", 422);
    }

    $created = $this->gigModel->create($data);

    if ($created) {
      ResponseHelper::success("Gig posted successfully");
    } else {
      ResponseHelper::error("Failed to post gig");
    }
  }

  // GET /gigs/{id}
  public function show($id)
  {
    $gig = $this->gigModel->find($id);

    if ($gig) {
      ResponseHelper::success($gig);
    } else {
      ResponseHelper::error("Gig not found", 404);
    }
  }
}
