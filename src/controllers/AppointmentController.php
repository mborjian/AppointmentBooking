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

    public function book($userId, $date, $time): bool
    {
        return $this->appointmentModel->bookAppointment($userId, $date, $time);
    }

    public function cancel($appointmentId): bool
    {
        return $this->appointmentModel->cancelAppointment($appointmentId);
    }

    public function view($date): false|array
    {
        return $this->appointmentModel->getAppointments($date);
    }
}
