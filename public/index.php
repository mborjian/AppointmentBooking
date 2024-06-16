<?php

require_once __DIR__ . '/../vendor/autoload.php';

use AppointmentBooking\controllers\AppointmentController;
use AppointmentBooking\controllers\AuthController;

$appointmentController = new AppointmentController();
$authController = new AuthController();

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/register' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];
    $authController->register($username, $password);
} elseif ($uri === '/login' && $method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];
    $authController->login($username, $password);
} elseif ($uri === '/logout' && $method === 'POST') {
    $authController->logout();
} elseif ($uri === '/check-auth' && $method === 'GET') {
    $authController->checkAuth();
} elseif ($uri === '/book' && $method === 'POST') {
    $appointmentController->book();
} elseif ($uri === '/cancel' && $method === 'POST') {
    $appointmentController->cancel();
} elseif ($uri === '/appointments' && $method === 'GET') {
    $appointmentController->getAppointments();
} elseif ($uri === '/calendar' && $method === 'GET') {
    $calendarData = $appointmentController->getCalendarData();
    echo json_encode(['status' => 'success', 'days' => $calendarData]);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Not Found']);
}
