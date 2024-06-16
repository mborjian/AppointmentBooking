document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const bookingForm = document.getElementById('booking-form');
    const authSection = document.getElementById('auth-section');
    const bookingSection = document.getElementById('booking-section');
    const appointmentsList = document.getElementById('appointments-list');

    let currentUser = null;

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
        alert(result.status === 'success' ? 'Registration successful' : 'Registration failed');
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
            alert('Login failed');
        }
    });

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('appointment-date').value;
        const time = document.getElementById('appointment-time').value;

        const response = await fetch('/book', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: currentUser.id, date, time})
        });

        const result = await response.json();
        alert(result.status === 'success' ? 'Appointment booked' : 'Booking failed');
        await loadAppointments();
    });

    async function loadAppointments() {
        const date = document.getElementById('appointment-date').value;

        if (!date) return;

        const response = await fetch(`/appointments?date=${date}`);
        const appointments = await response.json();

        appointmentsList.innerHTML = appointments.map(appointment => `
            <div>
                ${appointment.appointment_time} - 
                <button onclick="cancelAppointment(${appointment.id})">Cancel</button>
            </div>
        `).join('');
    }

    window.cancelAppointment = async (id) => {
        const response = await fetch('/cancel', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({appointment_id: id})
        });

        const result = await response.json();
        alert(result.status === 'success' ? 'Appointment cancelled' : 'Cancellation failed');
        await loadAppointments();
    };
});
