<?php

require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';
require_once __DIR__ . '/../models/VehicleDocument.php';

class DriverController
{
    public function apply()
    {
        AccessControl::requireLogin();

        $userId = $_SESSION['user']['id'] ?? null;
        $vehicleType = $_POST['vehicle_type'] ?? null;
        $experience = $_POST['experience'] ?? null;

        if (!$userId || !$vehicleType || !$experience || !isset($_FILES['documents'])) {
            ResponseHelper::validationError([], "All fields are required");
        }

        $vehicleDocument = new VehicleDocument();
        $uploadResults = $vehicleDocument->uploadDocuments($userId, $vehicleType, $_FILES['documents']);

        if ($uploadResults['status']) {
            ResponseHelper::success([], "Driver application submitted successfully.");
        } else {
            ResponseHelper::error("Failed to upload documents", 500, $uploadResults['errors']);
        }
    }
}
