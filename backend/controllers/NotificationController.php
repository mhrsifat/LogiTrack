<?php

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../helpers/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class NotificationController
{
  private $notificationModel;

  public function __construct()
  {
    $this->notificationModel = new Notification();
  }

  // GET /notifications
  public function index()
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION['user_id'];
    $notifications = $this->notificationModel->getByUser($userId);

    return ResponseHelper::success($notifications);
  }

  // PUT /notifications/{id}/read
  public function markAsRead($id)
  {
    if (!AccessControl::isLoggedIn()) {
      return ResponseHelper::unauthorized("Login required.");
    }

    $userId = $_SESSION['user_id'];
    $success = $this->notificationModel->markAsRead($id, $userId);

    if ($success) {
      return ResponseHelper::success("Notification marked as read.");
    } else {
      return ResponseHelper::notFound("Notification not found or access denied.");
    }
  }
}