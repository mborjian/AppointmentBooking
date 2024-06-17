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

    if ($uri === 'appointments') {
        getAppointments();
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
    global $config;
    $today = new DateTime();
    $startOfWeek = $today->modify('this saturday');

    $dates = [];
    $dates[] = $startOfWeek->format('Ymd');
    for ($i = 1; $i < 7; $i++) {
        $date = $startOfWeek->modify('+1 day')->format('Ymd');
        $dates[] = $date;
    }

    $start_time = $config['start_time'];
    $end_time = $config['end_time'];

    $start = DateTime::createFromFormat('H:i', $start_time);
    $end = DateTime::createFromFormat('H:i', $end_time);

    $interval = new DateInterval('PT30M');
    $period = new DatePeriod($start, $interval, $end);
    $interval_count = iterator_count($period) + 1;

    $appointments = [
        ['start' => '10:00', 'end' => '12:00', 'date' => '20240622', 'text' => 'Corporate Finance', 'bgColor' => '#ffd6d1'],
        ['start' => '13:00', 'end' => '16:30', 'date' => '20240623', 'text' => 'Entertainment Law', 'bgColor' => '#fafaa3'],
        ['start' => '11:00', 'end' => '12:00', 'date' => '20240624', 'text' => 'Writing Seminar', 'bgColor' => '#e2f8ff'],
    ];

    $response = [
        'dates' => $dates,
        'start_time' => $start_time,
        'end_time' => $end_time,
        'interval_count' => $interval_count,
        'appointments' => $appointments
    ];

    echo json_encode($response);
}

function getAppointments(): void
{
    global $appointmentController;
    $date = $_GET['date'] ?? null;

    if ($date !== null) {
        $appointments = $appointmentController->getAppointments($date);
        echo json_encode($appointments);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Date parameter missing']);
    }
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
        if ($appointmentController->bookAppointment($date, $startTime, $endTime, $text)) {
            echo json_encode(['status' => 'success', 'message' => 'Appointment booked successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error booking appointment']);
        }
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
        if ($appointmentController->cancelAppointment($appointmentId)) {
            echo json_encode(['status' => 'success', 'message' => 'Appointment cancelled successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Error cancelling appointment']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Missing appointment_id']);
    }
}
