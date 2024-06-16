<?php

require_once __DIR__ . '/../vendor/autoload.php';

use AppointmentBooking\database\Connection;

try {
    $db = Connection::getInstance()->getConnection();

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
            FOREIGN KEY (user_id) REFERENCES users(id)
        )"
    ];

    foreach ($queries as $query) {
        $db->exec($query);
    }

    echo "Database setup completed successfully.\n";

} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
