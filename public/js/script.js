document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const bookingForm = document.getElementById('booking-form');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const bookingSection = document.getElementById('booking-section');
    const appointmentsSection = document.getElementById('appointments-section');
    const appointmentsTableBody = document.getElementById('appointments-table').querySelector('tbody');
    const appointmentStartTime = document.getElementById('appointment-start-time');
    const appointmentEndTime = document.getElementById('appointment-end-time');
    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navBookAppointment = document.getElementById('nav-book-appointment');
    const navViewAppointments = document.getElementById('nav-view-appointments');
    const navLogout = document.getElementById('nav-logout');
    const navLogoutItem = document.getElementById('nav-logout-item');

    let currentUser = null;

    const timeSlots = generateTimeSlots();

    function generateTimeSlots() {
        const slots = [];
        for (let hour = 8; hour < 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    }

    function populateTimeSelect(selectElement) {
        timeSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            selectElement.appendChild(option);
        });
    }

    populateTimeSelect(appointmentStartTime);
    populateTimeSelect(appointmentEndTime);

    async function checkAuthStatus() {
        const response = await fetch('/check-auth', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const result = await response.json();
        if (result.status === 'authenticated') {
            currentUser = result.user;
            navLogoutItem.classList.remove('d-none');
            navLogin.classList.add('d-none');
            navRegister.classList.add('d-none');
            navBookAppointment.classList.remove('d-none');
            navViewAppointments.classList.remove('d-none');
            loginSection.classList.add('d-none');
            registerSection.classList.add('d-none');
            bookingSection.classList.remove('d-none');
            appointmentsSection.classList.remove('d-none');
        } else {
            currentUser = null;
            navLogoutItem.classList.add('d-none');
            navLogin.classList.remove('d-none');
            navRegister.classList.remove('d-none');
            navBookAppointment.classList.add('d-none');
            navViewAppointments.classList.add('d-none');
            loginSection.classList.remove('d-none');
            registerSection.classList.add('d-none');
            bookingSection.classList.add('d-none');
            appointmentsSection.classList.add('d-none');
        }
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const result = await response.json();
        if (result.status === 'success') {
            currentUser = result.user;
            checkAuthStatus();
        } else {
            alert(result.message);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const result = await response.json();
        if (result.status === 'success') {
            currentUser = result.user;
            checkAuthStatus();
        } else {
            alert(result.message);
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please log in to book an appointment');
            return;
        }
        const userId = currentUser.id;
        const date = document.getElementById('appointment-date').value;
        const startTime = document.getElementById('appointment-start-time').value;
        const endTime = document.getElementById('appointment-end-time').value;

        const response = await fetch('/book', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, date, start_time: startTime, end_time: endTime})
        });

        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            loadAppointments();
        }
    });

    async function loadAppointments() {
        const date = document.getElementById('appointment-date-view').value;

        const response = await fetch(`/appointments?date=${date}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        });

        const appointments = await response.json();
        appointmentsTableBody.innerHTML = '';

        timeSlots.forEach(slot => {
            const tr = document.createElement('tr');
            const tdTime = document.createElement('td');
            tdTime.textContent = slot;
            tr.appendChild(tdTime);

            const tdStatus = document.createElement('td');
            const appointment = appointments.find(app => app.start_time === slot);

            if (appointment) {
                tdStatus.textContent = 'Booked';
                const tdAction = document.createElement('td');
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.classList.add('btn', 'btn-danger');
                cancelButton.addEventListener('click', () => cancelAppointment(appointment.id));
                tdAction.appendChild(cancelButton);
                tr.appendChild(tdAction);
            } else {
                tdStatus.textContent = 'Available';
                tr.appendChild(document.createElement('td'));
            }

            tr.appendChild(tdStatus);
            appointmentsTableBody.appendChild(tr);
        });
    }

    async function cancelAppointment(appointmentId) {
        const response = await fetch('/cancel', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({appointment_id: appointmentId})
        });

        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            loadAppointments();
        }
    }

    navLogin.addEventListener('click', () => {
        loginSection.classList.remove('d-none');
        registerSection.classList.add('d-none');
        bookingSection.classList.add('d-none');
        appointmentsSection.classList.add('d-none');
    });

    navRegister.addEventListener('click', () => {
        loginSection.classList.add('d-none');
        registerSection.classList.remove('d-none');
        bookingSection.classList.add('d-none');
        appointmentsSection.classList.add('d-none');
    });

    navBookAppointment.addEventListener('click', () => {
        loginSection.classList.add('d-none');
        registerSection.classList.add('d-none');
        bookingSection.classList.remove('d-none');
        appointmentsSection.classList.add('d-none');
    });

    navViewAppointments.addEventListener('click', () => {
        loginSection.classList.add('d-none');
        registerSection.classList.add('d-none');
        bookingSection.classList.add('d-none');
        appointmentsSection.classList.remove('d-none');
        loadAppointments();
    });

    navLogout.addEventListener('click', async () => {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });

        const result = await response.json();
        if (result.status === 'success') {
            currentUser = null;
            checkAuthStatus();
        }
    });

    checkAuthStatus();
});
