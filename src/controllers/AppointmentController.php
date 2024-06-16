<?php

namespace AppointmentBooking\controllers;

use AppointmentBooking\database\Connection;
use AppointmentBooking\models\Appointment;

class AppointmentController
{
    private Appointment $appointmentModel;

    public function __construct()
    {
        $this->appointmentModel = new Appointment();
    }


    public function book(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'];
        $date = $data['date'];
        $startTime = $data['start_time'];
        $endTime = $data['end_time'];

        if ($this->appointmentModel->bookAppointment($userId, $date, $startTime, $endTime)) {
            echo json_encode(['status' => 'success', 'message' => 'Appointment booked successfully']);
        }
        echo json_encode(['status' => 'error', 'message' => 'Error booking appointment']);
    }


    public function cancel(): void
    {
        $data = json_decode(file_get_contents('php://input'), true);
        $appointmentId = $data['appointment_id'];

        if ($this->appointmentModel->cancelAppointment($appointmentId)) {
            echo json_encode(['status' => 'success', 'message' => 'Appointment cancelled successfully']);
        }
        echo json_encode(['status' => 'error', 'message' => 'Error cancelling appointment']);
    }


    public function getAppointments(): void
    {
        $date = $_GET['date'];
        $appointments = $this->appointmentModel->getAppointments($date);
        echo json_encode($appointments);
    }
}
