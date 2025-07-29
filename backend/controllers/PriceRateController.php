<?php

require_once __DIR__ . '/../models/PriceRate.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class PriceRateController
{
  private $priceModel;

  public function __construct()
  {
    $this->priceModel = new PriceRate();
  }

  // GET /price-rates
  public function index()
  {
    if (!AccessControl::requireRole(['admin'])) {
      return ResponseHelper::unauthorized("Admins only.");
    }

    $rates = $this->priceModel->getAll();
    return ResponseHelper::success($rates);
  }

  // POST /price-rates
  public function store()
  {
    if (!AccessControl::requireRole(['admin'])) {
      return ResponseHelper::unauthorized("Admins only.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (
      empty($input['vehicle_type']) ||
      empty($input['route_name']) ||
      !isset($input['base_fare']) ||
      !isset($input['per_km_rate'])
    ) {
      return ResponseHelper::badRequest("Missing required fields.");
    }

    $data = [
      'vehicle_type' => trim($input['vehicle_type']),
      'base_fare' => (float)$input['base_fare'],
      'per_km_rate' => (float)$input['per_km_rate'],
      'route_name' => trim($input['route_name'])
    ];

    $success = $this->priceModel->create($data);
    return $success
      ? ResponseHelper::success("Price rate added.")
      : ResponseHelper::error("Failed to save rate.");
  }

  // PUT /price-rates/{id}
  public function update($id)
  {
    if (!AccessControl::requireRole(['admin'])) {
      return ResponseHelper::unauthorized("Admins only.");
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (
      empty($input['vehicle_type']) ||
      empty($input['route_name']) ||
      !isset($input['base_fare']) ||
      !isset($input['per_km_rate'])
    ) {
      return ResponseHelper::badRequest("Missing required fields.");
    }

    $data = [
      'vehicle_type' => trim($input['vehicle_type']),
      'base_fare' => (float)$input['base_fare'],
      'per_km_rate' => (float)$input['per_km_rate'],
      'route_name' => trim($input['route_name'])
    ];

    $success = $this->priceModel->update($id, $data);
    return $success
      ? ResponseHelper::success("Price rate updated.")
      : ResponseHelper::notFound("Rate not found.");
  }

  // DELETE /price-rates/{id}
  public function destroy($id)
  {
    if (!AccessControl::requireRole(['admin'])) {
      return ResponseHelper::unauthorized("Admins only.");
    }

    $success = $this->priceModel->delete($id);
    return $success
      ? ResponseHelper::success("Price rate deleted.")
      : ResponseHelper::notFound("Rate not found.");
  }
}