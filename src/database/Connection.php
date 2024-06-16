<?php

namespace AppointmentBooking\database;

use PDO;
use PDOException;

class Connection
{
    private static ?Connection $instance = null;
    private PDO $connection;

    private function __construct(bool $includeDbName = true)
    {
        $config = include __DIR__ . '/../../config/database.php';

        try {
            $connectionString = "mysql:host={$config['host']}:{$config['port']}";
            if ($includeDbName) {
                $connectionString .= ";dbname={$config['dbname']}";
            }

            $this->connection = new PDO(
                $connectionString,
                $config['user'],
                $config['password']
            );
            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance(bool $includeDbName = true): ?Connection
    {
        if (self::$instance === null) {
            self::$instance = new self($includeDbName);
        }

        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->connection;
    }
}
