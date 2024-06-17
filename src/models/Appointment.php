<?php

namespace AppointmentBooking\models;

use AppointmentBooking\database\Connection;
use PDO;
use PDOException;

class Appointment
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Connection::getInstance()->getConnection();
    }

    public function bookAppointment($date, $start_time, $end_time, $text): bool
    {
        try {
            if (strtotime($end_time) <= strtotime($start_time)) {
                return false;
            }

            $color = '#' . str_pad(dechex(rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
            $stmt = $this->db->prepare(
                'SELECT COUNT(*) FROM appointments WHERE date = :date 
                AND ((start_time < :end_time AND end_time > :start_time))'
            );

            $stmt->execute([
                'date' => $date,
                'start_time' => $start_time,
                'end_time' => $end_time
            ]);

            if ($stmt->fetchColumn() > 0) {
                return false;
            }

            $stmt = $this->db->prepare(
                'INSERT INTO appointments (date, start_time, end_time, text, color) VALUES (:date, :start_time, :end_time, :text, :color)'
            );

            return $stmt->execute([
                'date' => $date,
                'start_time' => $start_time,
                'end_time' => $end_time,
                'text' => $text,
                'color' => $color
            ]);
        } catch (PDOException $e) {
            error_log('Error booking appointment: ' . $e->getMessage());
            return false;
        }
    }


    public function cancelAppointment($appointmentId): bool
    {
        try {
            $stmt = $this->db->prepare(
                'DELETE FROM appointments WHERE id = :id'
            );

            return $stmt->execute(['id' => $appointmentId]);
        } catch (PDOException $e) {
            error_log('Error cancelling appointment: ' . $e->getMessage());
            return false;
        }
    }

    public function getAppointments($date): array
    {
        try {
            $stmt = $this->db->prepare(
                'SELECT * FROM appointments WHERE date = :date'
            );

            $stmt->execute(['date' => $date]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Error fetching appointments: ' . $e->getMessage());
            return [];
        }
    }


    public function getAppointmentsByDateRange($startDate, $endDate): array
    {
        $sql = "SELECT * FROM appointments 
                WHERE date >= :startDate AND date <= :endDate
                ORDER BY date, start_time ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
