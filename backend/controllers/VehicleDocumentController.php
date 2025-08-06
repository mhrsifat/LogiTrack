<?php

require_once __DIR__ . '/../models/VehicleDocument.php';
require_once __DIR__ . '/../models/Vehicle.php';
require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class VehicleDocumentController
{
  private $docModel;
  private $vehicleModel;

  public function __construct()
  {
    $this->docModel = new VehicleDocument();
    $this->vehicleModel = new Vehicle();
  }

  // GET /vehicle-documents
  public function index()
  {
    if (!AccessControl::requireRole(['driver'])) {
      return ResponseHelper::unauthorized("Only drivers can access this.");
    }

    $driverId = $_SESSION['user_id'];
    $docs = $this->docModel->getByDriver($driverId);
    return ResponseHelper::success($docs);
  }

  // POST /vehicle-documents
public function handleSubmitDocument()
{
    if (!AccessControl::requireRole(['driver'])) {
        return ResponseHelper::unauthorized("Only drivers can upload.");
    }

    $driverId = $_SESSION['userId'];

    // Validate required form-data fields
    if (
        !isset($_POST['document_type']) ||
        !isset($_POST['license_plate']) ||
        !isset($_POST['capacity_kg']) ||
        !isset($_FILES['documents'])
    ) {
        return ResponseHelper::badRequest("Missing required fields or files.");
    }

    // Generate a 5–10 letter random submit_id
    $submit_id = substr(
        str_shuffle(str_repeat('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)),
        0,
        rand(5, 10)
    );

    $documentType  = $_POST['document_type'];
    $licensePlate  = $_POST['license_plate'];
    $capacityKg    = $_POST['capacity_kg'];
    $files         = $_FILES['documents'];
    $uploadedFiles = [];

    // Handle each uploaded file
    for ($i = 0; $i < count($files['name']); $i++) {
        if ($files['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }

        $file = [
            'name'     => $files['name'][$i],
            'tmp_name' => $files['tmp_name'][$i],
        ];

        $filePath = $this->handleUpload($file);  // your upload helper
        if ($filePath) {
            // Save document record
            $this->docModel->create([
                'driver_id'     => $driverId,
                'document_type' => $documentType,
                'file_path'     => $filePath,
                'submit_id'     => $submit_id,
            ]);
            $uploadedFiles[] = $filePath;
        }
    }

    if (count($uploadedFiles) === 0) {
        return ResponseHelper::error("No files were uploaded successfully.");
    }

    // Now create the vehicle record, linking via same submit_id
    $vehicleData = [
        'license_plate' => $licensePlate,
        'capacity_kg'   => $capacityKg,
        'type'          => $documentType,
    ];
    $userId = $_SESSION["userId"];
    $this->vehicleModel->create($vehicleData, $userId, $submit_id);

    return ResponseHelper::success(
        ['files' => $uploadedFiles, 'submit_id' => $submit_id],
        "Documents and vehicle saved successfully."
    );
}

  // PUT /vehicle-documents/{id}
  public function update($id)
  {
    if (!AccessControl::requireRole(['driver'])) {
      return ResponseHelper::unauthorized("Only drivers can update.");
    }

    parse_str(file_get_contents("php://input"), $putData);

    if (!isset($putData['document_type']) || !isset($putData['file_path'])) {
      return ResponseHelper::badRequest("Missing data for update.");
    }

    $driverId = $_SESSION['user_id'];
    $data = [
      'document_type' => $putData['document_type'],
      'file_path' => $putData['file_path'] // Assume front uploads and sends path
    ];

    $success = $this->docModel->update($id, $driverId, $data);
    return $success
      ? ResponseHelper::success("Document updated.")
      : ResponseHelper::notFound("Document not found or access denied.");
  }

  // DELETE /vehicle-documents/{id}
  public function destroy($id)
  {
    if (!AccessControl::requireRole(['driver'])) {
      return ResponseHelper::unauthorized("Only drivers can delete.");
    }

    $driverId = $_SESSION['user_id'];
    $success = $this->docModel->delete($id, $driverId);

    return $success
      ? ResponseHelper::success("Document deleted.")
      : ResponseHelper::notFound("Document not found or access denied.");
  }

  // 🔐 Secure file upload handler
  private function handleUpload($file)
  {
    $targetDir = __DIR__ . "/../uploads/documents/";
    if (!is_dir($targetDir)) {
      mkdir($targetDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('doc_', true) . '.' . $ext;
    $targetPath = $targetDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
      return 'uploads/documents/' . $filename;
    }

    return false;
  }

  public function submitDocument($driverId)
  {
    // 1) Ensure file was uploaded
    if (empty($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
      return ResponseHelper::error("No file uploaded or upload error");
    }

    // 2) Move file into public/vehiclePic/
    $tmpPath    = $_FILES['document']['tmp_name'];
    $origName   = $_FILES['document']['name'];
    $ext        = pathinfo($origName, PATHINFO_EXTENSION);
    $storedName = uniqid('doc_') . "." . $ext;
    $destDir    = __DIR__ . "/../../public/vehiclePic/";
    if (!is_dir($destDir)) {
      mkdir($destDir, 0755, true);
    }
    $destPath = $destDir . $storedName;
    if (!move_uploaded_file($tmpPath, $destPath)) {
      return ResponseHelper::error("Failed to move uploaded file");
    }

    // 3) Prepare data array
    $data = [
      'driver_id'     => $driverId,
      'vehicle_type'  => $_POST['vehicle_type']  ?? null,
      'document_path' => "/vehiclePic/" . $storedName,
      'file_name'     => $storedName,
      'original_name' => $origName,
    ];

    // 4) Insert into DB
    $newId = $this->docModel->insertDocument($data);
    if (! $newId) {
      return ResponseHelper::error("Database insert failed");
    }

    return ResponseHelper::success(
      ['document_id' => $newId],
      "Document uploaded successfully"
    );
  }
}
