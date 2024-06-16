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

    public function book($userId, $date, $start_time, $end_time): array
    {
        if ($this->appointmentModel->bookAppointment($userId, $date, $start_time, $end_time)) {
            return ['status' => 'success', 'message' => 'Appointment booked successfully'];
        }
        return ['status' => 'error', 'message' => 'Failed to book appointment. It may overlap with an existing appointment or the end time is before the start time.'];
    }

    public function cancel($appointmentId): array
    {
        if ($this->appointmentModel->cancelAppointment($appointmentId)) {
            return ['status' => 'success', 'message' => 'Appointment cancelled successfully'];
        }
        return ['status' => 'error', 'message' => 'Failed to cancel appointment'];
    }

    public function view($date): false|array
    {
        return $this->appointmentModel->getAppointments($date);
    }
}
