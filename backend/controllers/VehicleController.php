<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/Mailer.php";
require_once __DIR__ . "/../models/Vehicle.php";

class VehicleController
{
    private $vehicleModel;

    public function __construct()
    {
        $this->vehicleModel = new Vehicle();
    }

    // GET /vehicles - List all vehicles
    public function index()
    {
        $vehicles = $this->vehicleModel->getAll();
        echo json_encode(["status" => "success", "data" => $vehicles]);
    }

    // GET /vehicles/{id} - Show a specific vehicle
    public function show($id)
    {
        $vehicle = $this->vehicleModel->getById($id);

        if (!$vehicle) {
            http_response_code(404);
            echo json_encode(["error" => "Vehicle not found"]);
            return;
        }

        echo json_encode(["status" => "success", "data" => $vehicle]);
    }

    // POST /vehicles - Create new vehicle
    public function store()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $result = $this->vehicleModel->create($data);

        echo json_encode(["status" => "success", "message" => "Vehicle created successfully", "data" => $result]);
    }

    // PUT /vehicles/{id} - Update vehicle
    public function update($id)
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $this->vehicleModel->update($id, $data);

        echo json_encode(["status" => "success", "message" => "Vehicle updated successfully"]);
    }

    // DELETE /vehicles/{id} - Delete vehicle
    public function destroy($id)
    {
        $this->vehicleModel->delete($id);
        echo json_encode(["status" => "success", "message" => "Vehicle deleted successfully"]);
    }

    public function showDriverVehicle()
    {
        $driverId = $_SESSION["userId"];
        $vehicle = $this->vehicleModel->getByUserId($driverId);

        if (!$vehicle) {
            http_response_code(404);
            echo json_encode(["error" => "Vehicle not found"]);
            return;
        }

        ResponseHelper::success($vehicle);
    }
}