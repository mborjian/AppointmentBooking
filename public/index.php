<?php

require_once __DIR__ . '/../vendor/autoload.php';

use AppointmentBooking\controllers\AppointmentController;
use AppointmentBooking\controllers\UserController;

$appointmentController = new AppointmentController();
$userController = new UserController();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

if ($uri === '/register' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];
    $result = $userController->register($username, $password);
    echo json_encode($result ? ['status' => 'success', 'message' => 'Registration successful'] : ['status' => 'error', 'message' => 'Registration failed']);
} elseif ($uri === '/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];
    $user = $userController->login($username, $password);
    if ($user) {
        echo json_encode(['status' => 'success', 'user' => $user]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    }
} elseif ($uri === '/book' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'];
    $date = $data['date'];
    $start_time = $data['start_time'];
    $end_time = $data['end_time'];
    $result = $appointmentController->book($userId, $date, $start_time, $end_time);
    echo json_encode($result);
} elseif ($uri === '/cancel' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $appointmentId = $data['appointment_id'];
    $result = $appointmentController->cancel($appointmentId);
    echo json_encode($result);
} elseif ($uri === '/appointments' && $method === 'GET') {
    $date = $_GET['date'];
    $appointments = $appointmentController->view($date);
    echo json_encode($appointments);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Not Found']);
}
