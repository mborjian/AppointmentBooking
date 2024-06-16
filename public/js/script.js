document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const bookingForm = document.getElementById('booking-form');
    const authSection = document.getElementById('auth-section');
    const bookingSection = document.getElementById('booking-section');
    const appointmentsTableBody = document.getElementById('appointments-table').querySelector('tbody');
    const appointmentStartTime = document.getElementById('appointment-start-time');
    const appointmentEndTime = document.getElementById('appointment-end-time');

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
            authSection.style.display = 'none';
            bookingSection.style.display = 'block';
            await loadAppointments();
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
        await loadAppointments();
    });

    async function loadAppointments() {
        const date = document.getElementById('appointment-date').value;
        if (!date) return;

        const response = await fetch(`/appointments?date=${date}`);
        const appointments = await response.json();

        appointmentsTableBody.innerHTML = '';
        timeSlots.forEach(slot => {
            const appointment = appointments.find(app => app.start_time === slot);
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            timeCell.textContent = slot;
            row.appendChild(timeCell);

            const statusCell = document.createElement('td');
            const actionCell = document.createElement('td');
            if (appointment) {
                statusCell.textContent = 'Booked';
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Cancel';
                cancelButton.onclick = () => cancelAppointment(appointment.id);
                actionCell.appendChild(cancelButton);
            } else {
                statusCell.textContent = 'Available';
                actionCell.textContent = 'N/A';
            }
            row.appendChild(statusCell);
            row.appendChild(actionCell);
            appointmentsTableBody.appendChild(row);
        });
    }

    window.cancelAppointment = async (id) => {
        const response = await fetch('/cancel', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({appointment_id: id})
        });

        const result = await response.json();
        alert(result.message);
        await loadAppointments();
    };

    document.getElementById('appointment-date').addEventListener('change', loadAppointments);
});
