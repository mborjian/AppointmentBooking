<?php

namespace AppointmentBooking\database;

use PDO;
use PDOException;

class Connection
{
    private static ?Connection $instance = null;
    private PDO $connection;
    

    private function __construct()
    {
        $config = include __DIR__ . '/../../config/database.php';

        $this->createDatabaseIfNotExists($config['dbname']);

        try {
            $this->connection = new PDO(
                "mysql:host={$config['host']}:{$config['port']};dbname={$config['dbname']}",
                $config['user'],
                $config['password']
            );
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance(): ?Connection
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }

    private function createDatabaseIfNotExists(string $dbName): void
    {
        $config = include __DIR__ . '/../../config/database.php';

        $dsn = "mysql:host=" . $config['host'] . ':' . $config['port'];
        $user = $config['user'];
        $password = $config['password'];

        try {
            $pdo = new PDO($dsn, $user, $password);
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName`");
        } catch (PDOException $e) {
            die("Database creation failed: " . $e->getMessage());
        }
    }
}
