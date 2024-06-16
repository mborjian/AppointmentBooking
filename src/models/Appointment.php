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

    public function bookAppointment($userId, $date, $start_time, $end_time): bool
    {
        if (strtotime($end_time) <= strtotime($start_time)) {
            return false;
        }

        $stmt = $this->db->prepare(
            'SELECT COUNT(*) FROM appointments WHERE user_id = :user_id AND date = :date AND ((start_time < :end_time AND end_time > :start_time))'
        );

        $stmt->execute([
            'user_id' => $userId,
            'date' => $date,
            'start_time' => $start_time,
            'end_time' => $end_time
        ]);

        if ($stmt->fetchColumn() > 0) {
            return false;
        }

        $stmt = $this->db->prepare(
            'INSERT INTO appointments (user_id, date, start_time, end_time) VALUES (:user_id, :date, :start_time, :end_time)'
        );

        return $stmt->execute([
            'user_id' => $userId,
            'date' => $date,
            'start_time' => $start_time,
            'end_time' => $end_time
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
            'SELECT * FROM appointments WHERE date = :date'
        );
        $stmt->execute(['date' => $date]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
