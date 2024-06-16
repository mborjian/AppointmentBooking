<?php

namespace AppointmentBooking\controllers;

use AppointmentBooking\models\User;

class UserController
{
    private User $userModel;

    public function __construct()
    {
        $this->userModel = new User();
    }

    public function register($username, $password): bool
    {
        return $this->userModel->register($username, $password);
    }

    public function login($username, $password): mixed
    {
        return $this->userModel->authenticate($username, $password);
    }
}
