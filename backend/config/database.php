<?php
// config/database.php

require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/config.php';

class Database
{
    private $conn = null;

    private $host;
    private $dbName;
    private $username;
    private $password;
    private $charset;

    public function __construct()
    {
        $this->host     = $_ENV['DB_HOST'];
        $this->dbName   = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASS'];
        $this->charset  = $_ENV['DB_CHARSET'];
    }

    public function connect()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->dbName};charset={$this->charset}";

        try {
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log("DB connect failed ({$this->host}): " . $e->getMessage());
            return null;
        }

        return $this->conn;
    }
}

function connectDB()
{
    $db = new Database();
    return $db->connect();
}
