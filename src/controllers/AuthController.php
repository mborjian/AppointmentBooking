<?php

namespace AppointmentBooking\controllers;

use AppointmentBooking\models\User;

class AuthController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function checkAuth(): void
    {
        session_start();
        if (isset($_SESSION['user_id'])) {
            $user = $this->userModel->getUserById($_SESSION['user_id']);
            echo json_encode(['status' => 'authenticated', 'user' => $user]);
        } else {
            echo json_encode(['status' => 'unauthenticated']);
        }
    }

    public function login($username, $password): void
    {
        $user = $this->userModel->authenticate($username, $password);
        if ($user) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
        }
    }

    public function logout(): void
    {
        session_start();
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
    }

    public function register($username, $password): void
    {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $result = $this->userModel->createUser($username, $hashedPassword);
        if ($result) {
            $user = $this->userModel->authenticate($username, $password);
            if ($user) {
                session_start();
                $_SESSION['user_id'] = $user['id'];
                echo json_encode(['status' => 'success', 'message' => 'User registered and logged in successfully', 'user' => $user]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Registration successful, but failed to log in']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error registering user']);
        }
    }
}
