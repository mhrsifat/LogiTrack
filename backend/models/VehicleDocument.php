<?php

require_once __DIR__ . '/../config/database.php';

class VehicleDocument
{
  private $pdo;
  private $table = "vehicle_documents";

  public function __construct()
  {
    $this->pdo = connectDB();
  }

  public function uploadDocuments($driverId, $vehicleType, $files)
  {
    $uploadDir = __DIR__ . '/../uploads/vehicle_docs/';
    if (!is_dir($uploadDir)) {
      mkdir($uploadDir, 0755, true);
    }

    $errors = [];
    $successCount = 0;

    foreach ($files['name'] as $index => $originalName) {
      $tmpName = $files['tmp_name'][$index];
      $error = $files['error'][$index];

      if ($error !== UPLOAD_ERR_OK) {
        $errors[] = "Failed to upload file: $originalName";
        continue;
      }

      $extension = pathinfo($originalName, PATHINFO_EXTENSION);
      $uniqueName = uniqid("doc_", true) . "." . $extension;
      $destination = $uploadDir . $uniqueName;

      if (move_uploaded_file($tmpName, $destination)) {
        $stmt = $this->pdo->prepare("
        INSERT INTO {$this->table} 
        (driver_id, vehicle_type, document_path, file_name, original_name, created_at, uploaded_at) 
        VALUES 
        (:driver_id, :vehicle_type, :document_path, :file_name, :original_name, NOW(), NOW())
      ");

        $success = $stmt->execute([
          'driver_id' => $driverId,
          'vehicle_type' => $vehicleType,
          'document_path' => 'uploads/vehicle_docs/' . $uniqueName,
          'file_name' => $uniqueName,
          'original_name' => $originalName
        ]);

        if ($success) {
          $successCount++;
        } else {
          $errors[] = "DB insert failed for $originalName";
        }
      } else {
        $errors[] = "Failed to move uploaded file: $originalName";
      }
    }

    return [
      "status" => $successCount > 0,
      "errors" => $errors
    ];
  }


  public function getByDriver($driverId)
  {
    $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE driver_id = :driver_id ORDER BY created_at DESC");
    $stmt->execute([':driver_id' => $driverId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function create($data)
  {
    $stmt = $this->pdo->prepare("
      INSERT INTO {$this->table} (driver_id, document_type, file_path, submit_id, created_at)
      VALUES (:driver_id, :document_type, :file_path, :submit_id, NOW())
    ");

    return $stmt->execute([
      ':driver_id' => $data['driver_id'],
      ':document_type' => $data['document_type'],
      ':file_path' => $data['file_path'],
      ':submit_id' => $data['submit_id']
    ]);
  }

  public function createDriver($data)
  {
    $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (driver_id, vehicle_type, file_name, original_name, uploaded_at) VALUES (:driver_id, :vehicle_type, :file_name, :original_name, :uploaded_at)");

    return $stmt->execute([
      'driver_id' => $data['driver_id'],
      'vehicle_type' => $data['vehicle_type'],
      'file_name' => $data['file_name'],
      'original_name' => $data['original_name'],
      'uploaded_at' => $data['uploaded_at'],
    ]);
  }

  public function update($id, $driverId, $data)
  {
    $stmt = $this->pdo->prepare("
      UPDATE {$this->table}
      SET document_type = :document_type, file_path = :file_path
      WHERE id = :id AND driver_id = :driver_id
    ");

    return $stmt->execute([
      ':document_type' => $data['document_type'],
      ':file_path' => $data['file_path'],
      ':id' => $id,
      ':driver_id' => $driverId
    ]);
  }

  public function delete($id, $driverId)
  {
    $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id AND driver_id = :driver_id");
    return $stmt->execute([
      ':id' => $id,
      ':driver_id' => $driverId
    ]);
  }

   public function insertDocument(array $data)
    {
        $sql = "INSERT INTO {$this->table}
          (driver_id, vehicle_type, document_path, file_name, original_name)
         VALUES (?,         ?,            ?,             ?,         ?)";
        
        $stmt = $this->pdo->prepare($sql);
        $ok = $stmt->execute([
            $data['driver_id'],
            $data['vehicle_type'],
            $data['document_path'],
            $data['file_name'],
            $data['original_name'],
        ]);

        if (! $ok) {
            return false;
        }
        return (int)$this->pdo->lastInsertId();
    }
}

