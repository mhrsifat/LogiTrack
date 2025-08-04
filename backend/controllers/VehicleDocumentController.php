<?php

require_once __DIR__ . '/../models/VehicleDocument.php';
require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class VehicleDocumentController
{
  private $docModel;

  public function __construct()
  {
    $this->docModel = new VehicleDocument();
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
  public function store()
{
  if (!AccessControl::requireRole(['driver'])) {
    return ResponseHelper::unauthorized("Only drivers can upload.");
  }

  $driverId = $_SESSION['user_id'];

  if (!isset($_POST['document_type']) || !isset($_FILES['documents'])) {
    return ResponseHelper::badRequest("Missing document type or files.");
  }

  $documentType = $_POST['document_type'];
  $files = $_FILES['documents'];
  $uploadedFiles = [];

  for ($i = 0; $i < count($files['name']); $i++) {
    $file = [
      'name' => $files['name'][$i],
      'type' => $files['type'][$i],
      'tmp_name' => $files['tmp_name'][$i],
      'error' => $files['error'][$i],
      'size' => $files['size'][$i]
    ];

    if ($file['error'] !== UPLOAD_ERR_OK) {
      continue; // Skip failed files
    }

    $filePath = $this->handleUpload($file);
    if ($filePath) {
      $data = [
        'driver_id' => $driverId,
        'document_type' => $documentType,
        'file_path' => $filePath
      ];
      $this->docModel->create($data);
      $uploadedFiles[] = $filePath;
    }
  }

  if (count($uploadedFiles) > 0) {
    return ResponseHelper::success([
      'message' => "Documents uploaded successfully.",
      'files' => $uploadedFiles
    ]);
  } else {
    return ResponseHelper::error("No files were uploaded successfully.");
  }
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