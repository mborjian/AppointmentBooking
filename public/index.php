<?php

use AppointmentBooking\controllers\AppointmentController;

require_once __DIR__ . '/../vendor/autoload.php';

date_default_timezone_set('Asia/Tehran');

$appointmentController = new AppointmentController();

$uri = $_GET['action'];
$method = $_SERVER['REQUEST_METHOD'];

$config = include __DIR__ . '/../config/settings.php';


if ($method === 'GET') {
    if ($uri === 'current_week') {
        getCurrentWeek();
    }
}

if ($method === 'POST') {
    if ($uri === 'book') {
        bookAppointment();
    }
}

if ($method === 'DELETE') {
    parse_str(file_get_contents("php://input"), $delete_vars);
    if ($uri === 'cancel') {
        cancelAppointment();
    }
}


function getCurrentWeek(): void
{
    global $config, $appointmentController;

    $startOfWeek = (new DateTime())->modify('this saturday');

    $dates = [];
    for ($i = 0; $i < 7; $i++) {
        $date = (clone $startOfWeek)->modify('+' . $i . ' day')->format('Ymd');
        $dates[] = $date;
    }

    $start_time = $config['start_time'];
    $end_time = $config['end_time'];

    $start = DateTime::createFromFormat('H:i', $start_time);
    $end = DateTime::createFromFormat('H:i', $end_time);

    $interval = new DateInterval('PT30M');
    $period = new DatePeriod($start, $interval, $end);
    $interval_count = iterator_count($period) + 1;


    $appointments = $appointmentController->getAppointments(
        $startOfWeek->format('Y-m-d'), $startOfWeek->modify('+6 days')->format('Y-m-d')
    );

    $response = [
        'dates' => $dates,
        'start_time' => $start_time,
        'end_time' => $end_time,
        'interval_count' => $interval_count,
        'appointments' => $appointments
    ];

    echo json_encode($response);
}


function bookAppointment(): void
{
    global $appointmentController;
    $data = json_decode(file_get_contents('php://input'), true);

    $date = $data['date'] ?? null;
    $startTime = $data['start_time'] ?? null;
    $endTime = $data['end_time'] ?? null;
    $text = $data['text'] ?? null;

    if ($date && $startTime && $endTime && $text) {
        echo $appointmentController->bookAppointment($date, $startTime, $endTime, $text);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing required parameters']);
    }
}

function cancelAppointment(): void
{
    global $appointmentController;
    $data = json_decode(file_get_contents('php://input'), true);

    $appointmentId = $data['appointment_id'] ?? null;

    if ($appointmentId) {
        echo $appointmentController->cancelAppointment($appointmentId);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing appointment_id']);
    }
}
