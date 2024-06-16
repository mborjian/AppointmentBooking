<?php

namespace AppointmentBooking\models;

use AppointmentBooking\database\Connection;
use PDO;

class Appointment
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance()->getConnection();
    }

    public function bookAppointment($userId, $date, $time): bool
    {
        $stmt = $this->db->prepare(
            'INSERT INTO appointments (user_id, appointment_date, appointment_time) VALUES (:user_id, :appointment_date, :appointment_time)'
        );

        return $stmt->execute([
            'user_id' => $userId,
            'appointment_date' => $date,
            'appointment_time' => $time
        ]);
    }

    public function cancelAppointment($appointmentId): bool
    {
        $stmt = $this->db->prepare(
            'DELETE FROM appointments WHERE id = :id'
        );

        return $stmt->execute(['id' => $appointmentId]);
    }

    public function getAppointments($date): false|array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM appointments WHERE appointment_date = :appointment_date'
        );
        $stmt->execute(['appointment_date' => $date]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
