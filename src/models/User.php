<?php

namespace AppointmentBooking\models;

use AppointmentBooking\database\Connection;
use PDO;
use PDOException;

class User
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance()->getConnection();
    }

    public function register(string $username, string $password): bool
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $this->db->prepare(
                'INSERT INTO users (username, password) VALUES (:username, :password)'
            );

            $stmt->execute([
                ':username' => $username,
                ':password' => $hashedPassword
            ]);

            return true;

        } catch (PDOException $e) {
            return false;
        }
    }

    public function authenticate(string $username, string $password): mixed
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM users WHERE username = :username'
        );

        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            return $user;
        }

        return false;
    }

    public function createUser($username, $hashedPassword): bool
    {
        $stmt = $this->db->prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        return $stmt->execute([$username, $hashedPassword]);
    }


    public function getUserById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
