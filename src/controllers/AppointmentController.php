<?php

namespace AppointmentBooking\controllers;

use AppointmentBooking\models\Appointment;

class AppointmentController
{
    private Appointment $appointmentModel;

    public function __construct()
    {
        $this->appointmentModel = new Appointment();
    }

    public function bookAppointment($date, $startTime, $endTime, $text): false|string
    {
        if ($this->appointmentModel->bookAppointment($date, $startTime, $endTime, $text)) {
            return json_encode(['status' => 'success', 'message' => 'Appointment booked successfully']);
        }

        return json_encode(['status' => 'error', 'message' => 'Error booking appointment']);
    }

    public function cancelAppointment($appointmentId): false|string
    {
        if ($this->appointmentModel->cancelAppointment($appointmentId)) {
            return json_encode(['status' => 'success', 'message' => 'Appointment cancelled successfully']);
        }

        return json_encode(['status' => 'error', 'message' => 'Error cancelling appointment']);
    }

    public function getAppointments($date): false|string
    {
        $appointments = $this->appointmentModel->getAppointments($date);
        return json_encode($appointments);
    }
}
