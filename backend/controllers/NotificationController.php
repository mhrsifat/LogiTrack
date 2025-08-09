<?php
// File: src/controllers/NotificationController.php

require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../core/ResponseHelper.php';
require_once __DIR__ . '/../core/AccessControl.php';

class NotificationController
{
    private $model;

    public function __construct()
    {
        $this->model = new Notification();
    }

    // GET /notifications
    public function index()
    {
        if (!AccessControl::isLoggedIn()) {
            return ResponseHelper::unauthorized("Login required.");
        }

        $uid  = $_SESSION['userId'];
        $data = $this->model->getByUser($uid);

        return ResponseHelper::success($data);
    }

    // GET /notifications/unread-count
    public function unreadCount()
    {
        if (!AccessControl::isLoggedIn()) {
            return ResponseHelper::unauthorized("Login required.");
        }

        $uid  = $_SESSION['userId'];
        $cnt  = $this->model->getUnreadCount($uid);

        return ResponseHelper::success(['unread' => $cnt]);
    }

    // PUT /notifications/{id}/read
    public function markAsRead($id)
    {
        if (!AccessControl::isLoggedIn()) {
            return ResponseHelper::unauthorized("Login required.");
        }

        $uid = $_SESSION['userId'];
        $ok  = $this->model->markAsRead($id, $uid);

        if ($ok) {
            return ResponseHelper::success("Marked as read.");
        }

        return ResponseHelper::notFound("Notification not found or no access.");
    }

    // PUT /notifications/read-all
    public function markAllAsRead()
    {
        if (!AccessControl::isLoggedIn()) {
            return ResponseHelper::unauthorized("Login required.");
        }

        $uid = $_SESSION['userId'];
        $this->model->markAllAsRead($uid);

        return ResponseHelper::success("All marked as read.");
    }

    // POST /notifications
    public function create()
    {
        // only admin users can send notifications
        if (!AccessControl::isLoggedIn() || !AccessControl::isAdmin()) {
            return ResponseHelper::forbidden("Admin access required.");
        }

        $body = json_decode(file_get_contents('php://input'), true);
        $ok   = $this->model->create(
            $body['user_id'],
            $body['type'] ?? 'info',
            $body['title'],
            $body['message']
        );

        if ($ok) {
            return ResponseHelper::success("Notification sent.");
        }

        return ResponseHelper::error("Failed to send notification.");
    }
}
