<?php

namespace AppointmentBooking\models;

use AppointmentBooking\database\Connection;
use PDO;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance()->getConnection();
    }

    public function register($username, $password): bool
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $this->db->prepare(
            'INSERT INTO users (username, password) VALUES (:username, :password)'
        );

        return $stmt->execute([
            'username' => $username,
            'password' => $hashedPassword
        ]);
    }

    public function authenticate($username, $password): mixed
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE username = :username'
        );

        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }

        return false;
    }
}
