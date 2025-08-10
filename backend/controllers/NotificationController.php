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
        $id = $body['user_id'];
        $type = $body['type'] ?? 'info';
        $title = $body['title'];
        $message = $body['message'];

        if ($type == "email") {
            require_once __DIR__ . '/../models/User.php';
            $userModel = new User();
            $user = $userModel->findById($id);
            if (!$user) {
                return ResponseHelper::notFound("User not found.");
            }
            $userEmail = $user['email'];
            require_once __DIR__ . '/../core/Mailer.php';
            if (Mailer::send($userEmail, $title, $message)) {
                $ok   = $this->model->create($id, $type, $title, $message);

                if ($ok) {
                    return ResponseHelper::success("Email notification sent.");
                } else {
                    return ResponseHelper::error("Email send but Failed to create notification record.");
                }
            } else {
                return ResponseHelper::error("Failed to send email.");
            }
        } else {
            $ok = $this->model->create($id, $type, $title, $message);
            if ($ok) {
                return ResponseHelper::success("Notification created.");
            }
        }
    }
}
