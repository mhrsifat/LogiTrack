<?php

class ResponseHelper
{
    public static function success($data = [], $message = "Success", $code = 200)
    {
        http_response_code($code);
        echo json_encode([
            "status" => true,
            "message" => $message,
            "data" => $data
        ]);
        exit;
    }

    public static function error($message = "Something went wrong", $code = 400, $errors = [])
    {
        http_response_code($code);
        echo json_encode([
            "status" => false,
            "message" => $message,
            "errors" => $errors
        ]);
        exit;
    }

    public static function validationError($errors = [], $message = "Validation failed")
    {
        self::error($message, 422, $errors);
    }

    public static function notFound($message = "Resource not found")
    {
        self::error($message, 404);
    }

    public static function unauthorized($message = "Unauthorized")
    {
        self::error($message, 401);
    }

    public static function forbidden($message = "Forbidden")
    {
        self::error($message, 403);
    }

    public static function badRequest($message = "Bad request")
    {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $message
        ]);
        exit;
    }
}