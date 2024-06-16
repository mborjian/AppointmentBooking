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


    public function getCalendarData(): array
    {
        $days = [];

        $query = "SELECT * FROM days_table JOIN appointments_table ON days_table.id = appointments_table.day_id";
        $result = $this->db->query($query);

        while ($row = $result->fetch_assoc()) {
            $dayId = $row['day_id'];
            $dayName = $row['name'];
            $startTime = $row['start_time'];
            $endTime = $row['end_time'];

            if (!isset($days[$dayId])) {
                $days[$dayId] = [
                    'name' => $dayName,
                    'appointments' => []
                ];
            }

            $appointment = new Appointment(
                $row['id'],
                $row['start_time'],
                $row['end_time'],
                $row['text'],
                $row['bgColor']
            );

            $days[$dayId]['appointments'][] = $appointment;
        }

        return array_values($days);
    }

}
