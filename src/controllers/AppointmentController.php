<?php

namespace AppointmentBooking\controllers;

use AppointmentBooking\models\Appointment;
use DateTime;

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

    public function getAppointments($startDate, $endDate): array
    {
        $appointments = $this->appointmentModel->getAppointmentsByDateRange($startDate, $endDate);

        $formattedAppointments = [];
        foreach ($appointments as $appointment) {
            $date = DateTime::createFromFormat('Y-m-d', $appointment['date'])->format('Ymd');
            $startTime = DateTime::createFromFormat('H:i:s', $appointment['start_time'])->format('H:i');
            $endTime = DateTime::createFromFormat('H:i:s', $appointment['end_time'])->format('H:i');

            $formattedAppointments[] = [
                'id' => $appointment['id'],
                'start' => $startTime,
                'end' => $endTime,
                'date' => $date,
                'text' => $appointment['text'],
                'bgColor' => $appointment['color'],
            ];
        }

        return $formattedAppointments;
    }
}
