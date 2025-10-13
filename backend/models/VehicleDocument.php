<?php

require_once __DIR__ . '/../config/database.php';

class VehicleDocument
{
    private $pdo;
    private $table = "vehicle_documents";

    // Accept existing PDO to use same transaction (dependency injection)
    public function __construct($pdo = null)
    {
        $this->pdo = $pdo ?: connectDB();
    }

    // Basic sanitize helper
    private function sanitizeFileName($name)
    {
        // remove anything which isn't a word, dot, or dash
        $name = preg_replace('/[^\w.\-]/', '_', $name);
        return $name;
    }

    // $files is expected to be $_FILES['documents']
    public function uploadDocuments($driverId, $vehicleType, $files, $maxFileSize = 5 * 1024 * 1024)
    {
        $uploadDir = __DIR__ . '/../uploads/vehicle_docs/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $allowedMime = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'image/jpg'
        ];

        $errors = [];
        $successCount = 0;

        // normalize structure in case single file was uploaded
        if (!isset($files['name']) || !is_array($files['name'])) {
            return [
                "status" => false,
                "errors" => ["No documents found or invalid upload structure."]
            ];
        }

        foreach ($files['name'] as $index => $originalName) {
            $tmpName = $files['tmp_name'][$index] ?? null;
            $error = $files['error'][$index] ?? UPLOAD_ERR_NO_FILE;
            $size = $files['size'][$index] ?? 0;
            $type = $files['type'][$index] ?? '';

            if ($error !== UPLOAD_ERR_OK) {
                $errors[] = "Failed to upload file: $originalName (error $error)";
                continue;
            }

            if ($size > $maxFileSize) {
                $errors[] = "File too large: $originalName";
                continue;
            }

            if (!in_array($type, $allowedMime)) {
                $errors[] = "Invalid file type: $originalName";
                continue;
            }

            $extension = pathinfo($originalName, PATHINFO_EXTENSION);
            $safeBase = pathinfo($this->sanitizeFileName($originalName), PATHINFO_FILENAME);
            $uniqueName = uniqid($safeBase . "_", true) . "." . $extension;
            $destination = $uploadDir . $uniqueName;

            if (move_uploaded_file($tmpName, $destination)) {
                // store relative path for retrieval
                $documentPath = 'uploads/vehicle_docs/' . $uniqueName;

                $stmt = $this->pdo->prepare("
                    INSERT INTO {$this->table} 
                    (driver_id, vehicle_type, document_path, file_name, original_name, created_at, uploaded_at) 
                    VALUES 
                    (:driver_id, :vehicle_type, :document_path, :file_name, :original_name, NOW(), NOW())
                ");

                $success = $stmt->execute([
                    'driver_id' => $driverId,
                    'vehicle_type' => $vehicleType,
                    'document_path' => $documentPath,
                    'file_name' => $uniqueName,
                    'original_name' => $originalName
                ]);

                if ($success) {
                    $successCount++;
                } else {
                    // If DB insert fails, try to unlink the moved file to avoid orphan files
                    @unlink($destination);
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

    // other helper methods kept for compatibility, but they should use same $this->pdo
    public function getByDriver($driverId)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE driver_id = :driver_id ORDER BY created_at DESC");
        $stmt->execute([':driver_id' => $driverId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function insertDocument(array $data)
    {
        $sql = "INSERT INTO {$this->table}
          (driver_id, vehicle_type, document_path, file_name, original_name)
         VALUES (?, ?, ?, ?, ?)";
        
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