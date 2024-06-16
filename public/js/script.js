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

    let currentUser = null;

    const timeSlots = generateTimeSlots();

    function generateTimeSlots() {
        const slots = [];
        for (let hour = 0; hour < 12; hour++) {
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
        alert(result.message);
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
            loginSection.style.display = 'none';
            registerSection.style.display = 'none';
            bookingSection.style.display = 'block';
            appointmentsSection.style.display = 'block';
            loadAppointments().then(r => {});
        } else {
            alert(result.message);
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('appointment-date').value;
        const start_time = appointmentStartTime.value;
        const end_time = appointmentEndTime.value;

        const response = await fetch('/book', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: currentUser.id, date, start_time, end_time})
        });

        const result = await response.json();
        alert(result.message);
        if (result.status === 'success') {
            loadAppointments().then(r => {});
        }
    });

    async function loadAppointments() {
        const date = document.getElementById('appointment-date').value;

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
                cancelButton.className = 'btn btn-danger';
                cancelButton.addEventListener('click', () => cancelAppointment(appointment.id));
                tdAction.appendChild(cancelButton);
                tr.appendChild(tdAction);
            } else {
                tdStatus.textContent = 'Available';
                const tdAction = document.createElement('td');
                tdAction.textContent = '-';
                tr.appendChild(tdAction);
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
            loadAppointments().then(r => {});
        }
    }

    navLogin.addEventListener('click', () => {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
        bookingSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
    });

    navRegister.addEventListener('click', () => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        bookingSection.style.display = 'none';
        appointmentsSection.style.display = 'none';
    });

    navBookAppointment.addEventListener('click', () => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        bookingSection.style.display = 'block';
        appointmentsSection.style.display = 'none';
    });

    navViewAppointments.addEventListener('click', () => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        bookingSection.style.display = 'none';
        appointmentsSection.style.display = 'block';
        loadAppointments().then(r => {});
    });
});
