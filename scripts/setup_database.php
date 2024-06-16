<?php

require_once __DIR__ . '/../vendor/autoload.php';

use AppointmentBooking\database\Connection;

$shouldDrop = false;

$options = getopt("", ["drop"]);
if (isset($options['drop'])) {
    $shouldDrop = true;
}

try {
    $config = include __DIR__ . '/../config/database.php';
    $dsn = "mysql:host=" . $config['host'] . ':' . $config['port'];
    $user = $config['user'];
    $password = $config['password'];
    $pdo = new PDO($dsn, $user, $password);

    $db = Connection::getInstance()->getConnection();

    if ($shouldDrop) {
        try {
            $pdo->exec("DROP DATABASE IF EXISTS `{$config['dbname']}`");
            echo "Database dropped successfully.\n";
        } catch (PDOException $e) {
            die("Database drop failed: " . $e->getMessage());
        }
    }

    try {
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['dbname']}`");
    } catch (PDOException $e) {
        die("Database creation failed: " . $e->getMessage());
    }

    $queries = [
        "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )",
        "CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_user_date_time (user_id, date, start_time, end_time)
        )"
    ];

    foreach ($queries as $query) {
        $db->exec($query);
    }

    echo "Database setup completed successfully.\n";

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
