# Appointment Booking System

This is a simple appointment booking system developed in PHP. It allows users to select, book, and cancel appointments in a Jalali/Shamsi calendar view.

## Features
- Select and book appointments for specific dates and times.
- View booked and available slots in the calendar.
- Cancel appointments and update the calendar.
- Ensure only one appointment per time slot.

## Requirements
- PHP 8 or higher
- PDO for database interaction
- Composer for dependency management

## Installation
```bash
git clone https://github.com/mborjian/AppointmentBooking.git
cd AppointmentBooking
composer install

php scripts/setup_database.php
```

or for clean installation:
```bash
php scripts/setup_database.php --drop
```

## Usage
```bash
php -S localhost:8000 -t public
```