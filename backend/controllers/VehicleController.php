<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../core/ResponseHelper.php";
require_once __DIR__ . "/../core/Mailer.php";
require_once __DIR__ . "/../models/Vehicle.php";
require_once __DIR__ . "/../models/VehicleDocument.php";

class VehicleController
{
    private $vehicleModel;
    private $docModel;

    public function __construct()
    {
        $this->vehicleModel = new Vehicle();
        $this->docModel = new VehicleDocument();
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

    // Post /vehicles/{id} - Update vehicle
   public function update($id)
    {
        // 1) Parse JSON fields for vehicle update
        //    (we’ll read fallback from POST if you prefer multipart)
        $raw  = file_get_contents("php://input");
        $json = json_decode($raw, true);

        // If multipart/form-data, use $_POST instead:
        $data = [
            'type'          => $json['type']          ?? $_POST['type']          ?? null,
            'license_plate' => $json['license_plate'] ?? $_POST['license_plate'] ?? null,
            'capacity_kg'   => $json['capacity_kg']   ?? $_POST['capacity_kg']   ?? null,
            'status'        => $json['status']        ?? $_POST['status']        ?? 'pending',
        ];

        // 2) Update vehicles table
        $updated = $this->vehicleModel->update($id, $data);

        if (! $updated) {
            return ResponseHelper::error("Failed to update vehicle");
        }

        // 3) Handle document upload, if provided
        if (! empty($_FILES['document']) && $_FILES['document']['error'] === UPLOAD_ERR_OK) {
            $tmpPath    = $_FILES['document']['tmp_name'];
            $origName   = $_FILES['document']['name'];
            $ext        = pathinfo($origName, PATHINFO_EXTENSION);
            $storedName = uniqid('doc_') . "." . $ext;
            $destDir    = __DIR__ . "/../uploads/vehiclePic/";
            if (! is_dir($destDir)) {
                mkdir($destDir, 0755, true);
            }
            $destPath = $destDir . $storedName;

            if (move_uploaded_file($tmpPath, $destPath)) {
                // prepare document data
                $docData = [
                    'driver_id'     => $id,                          // assuming driver = vehicle owner
                    'vehicle_type'  => $data['type'],
                    'document_path' => "/vehiclePic/" . $storedName,
                    'file_name'     => $storedName,
                    'original_name' => $origName,
                ];
                $newDocId = $this->docModel->insertDocument($docData);
                if (! $newDocId) {
                    // log error but vehicle is updated
                    error_log("Failed to insert vehicle_document for vehicle $id");
                }
            }
        }

        return ResponseHelper::success([], "Vehicle updated—and document saved if provided");
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