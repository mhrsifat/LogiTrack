<?php
class AccessControl
{
    public static function isLoggedIn(): bool
    {
        return isset($_SESSION['userId']) && isset($_SESSION['role']);
    }

    public static function isAdmin(): bool
    {
        return self::isLoggedIn() && $_SESSION['role'] === 'admin';
    }

    public static function isDriver(): bool
    {
        return self::isLoggedIn() && $_SESSION['role'] === 'driver';
    }

    public static function isUser(): bool
    {
        return self::isLoggedIn() && $_SESSION['role'] === 'user';
    }

    public static function isOperator(): bool
    {
        return self::isLoggedIn() && $_SESSION['role'] === 'operator';
    }

 public static function requireRole(array $roles): bool
{
    if (!self::isLoggedIn() || !in_array($_SESSION['role'], $roles)) {
        http_response_code(403); // Forbidden
        echo json_encode(['error' => 'Unauthorized access']);
        exit;  // Immediately stop script execution
    }
    return true; // User has required role
}


    public static function requireLogin()
    {
        if (!self::isLoggedIn()) {
            http_response_code(401); // Unauthorized
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }
    }

     public static function getCurrentUser(): ?array
    {
        if (!self::isLoggedIn()) {
            return null;
        }

        return [
            "id" => $_SESSION['userId'],
            "role" => $_SESSION['role'],
            "email" => $_SESSION['email'] ?? null,
            "name" => $_SESSION['name'] ?? null,
        ];
    }
}