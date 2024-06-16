<?php

require_once __DIR__ . '/../vendor/autoload.php';

use AppointmentBooking\controllers\AppointmentController;

$controller = new AppointmentController();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/book' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $data['user_id'];
    $date = $data['date'];
    $time = $data['time'];
    $controller->book($userId, $date, $time);
    echo json_encode(['status' => 'success']);
} elseif ($uri === '/cancel' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $appointmentId = $data['appointment_id'];
    $controller->cancel($appointmentId);
    echo json_encode(['status' => 'success']);
} elseif ($uri === '/appointments' && $method === 'GET') {
    $date = $_GET['date'];
    $appointments = $controller->view($date);
    echo json_encode($appointments);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Not Found']);
}
