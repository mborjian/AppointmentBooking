document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const bookingForm = document.getElementById('booking-form');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const bookingSection = document.getElementById('booking-section');
    const appointmentsSection = document.getElementById('appointments-section');
    const calendarSection = document.getElementById('calendar-section');
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

    checkAuthStatus();

    navLogin.addEventListener('click', () => showSection('login'));

    navRegister.addEventListener('click', () => showSection('register'));

    navBookAppointment.addEventListener('click', () => showSection('booking'));

    navViewAppointments.addEventListener('click', () => {
        showSection('appointments');
        loadAppointments();
    });

    navLogout.addEventListener('click', async () => {
        fetch('logout', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.status === 'success') {
                    currentUser = null;
                    checkAuthStatus();
                    showSection('login');
                } else {
                    alert(data.message);
                }
            });
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        fetch('login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    currentUser = data.user;
                    checkAuthStatus();
                    showSection('calendar');
                } else {
                    alert(data.message);
                }
            });
    });


    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        fetch('register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    currentUser = data.user;
                    checkAuthStatus();
                    // showSection('login');
                } else {
                    alert(data.message);
                }
            });
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

        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }
        fetch('book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({user_id: userId, date: date, start_time: startTime, end_time: endTime}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Appointment booked successfully');
                    loadAppointments();
                } else {
                    alert(data.message);
                }
            });
    });

    async function loadAppointments() {

        var date = document.getElementById('appointment-date-view').value;
        fetch('appointments?date=' + date)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    var tbody = document.getElementById('appointments-table').querySelector('tbody');
                    tbody.innerHTML = '';
                    data.appointments.forEach(function (appointment) {
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<td>' + appointment.time + '</td><td>' + appointment.status + '</td><td><button class="btn btn-danger btn-sm" onclick="cancelAppointment(' + appointment.id + ')">Cancel</button></td>';
                        tbody.appendChild(tr);
                    });
                } else {
                    alert(data.message);
                }
            });
    }

    async function cancelAppointment(appointmentId) {
        fetch('cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({appointment_id: appointmentId}),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    loadAppointments();
                } else {
                    alert(data.message);
                }
            });
    }

    function showSection(section) {
        loginSection.classList.add('d-none');
        registerSection.classList.add('d-none');
        bookingSection.classList.add('d-none');
        appointmentsSection.classList.add('d-none');
        calendarSection.classList.add('d-none');

        switch (section) {
            case 'login':
                loginSection.classList.remove('d-none');
                break;
            case 'register':
                registerSection.classList.remove('d-none');
                break;
            case 'booking':
                bookingSection.classList.remove('d-none');
                break;
            case 'appointments':
                appointmentsSection.classList.remove('d-none');
                break;
            case 'calendar':
                calendarSection.classList.remove('d-none');
                loadCalendar();
                break;
        }
    }

    function loadCalendar() {
        fetch('calendar')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    var calendar = document.getElementById('calendar');
                    calendar.innerHTML = '';

                    var timeline = document.createElement('div');
                    timeline.classList.add('timeline');
                    for (var i = 7; i < 17; i++) {
                        var timeSlot = document.createElement('div');
                        timeSlot.textContent = i + ':00';
                        timeline.appendChild(timeSlot);
                        timeSlot = document.createElement('div');
                        timeSlot.textContent = i + ':30';
                        timeline.appendChild(timeSlot);
                    }
                    calendar.appendChild(timeline);

                    data.days.forEach(function (day) {
                        var dayColumn = document.createElement('div');
                        dayColumn.classList.add('day');
                        dayColumn.textContent = day.name;
                        calendar.appendChild(dayColumn);

                        var occupiedCells = {};

                        day.appointments.forEach(function (appointment) {
                            var startTime = appointment.start_time;
                            var endTime = appointment.end_time;
                            var startHour = parseInt(startTime.split(':')[0]);
                            var startMinute = parseInt(startTime.split(':')[1]);
                            var endHour = parseInt(endTime.split(':')[0]);
                            var endMinute = parseInt(endTime.split(':')[1]);

                            var startRow = (startHour - 7) * 2 + (startMinute / 30) + 1;
                            var endRow = (endHour - 7) * 2 + (endMinute / 30) + 1;

                            for (var row = startRow; row < endRow; row++) {
                                occupiedCells[row] = true;
                            }

                            var eventDiv = document.createElement('div');
                            eventDiv.classList.add('event');
                            eventDiv.style.gridRow = startRow + ' / ' + endRow;
                            eventDiv.style.backgroundColor = appointment.bgColor;
                            eventDiv.textContent = appointment.text;
                            dayColumn.appendChild(eventDiv);
                        });

                        for (var row = 1; row <= 20; row++) {
                            if (!occupiedCells[row]) {
                                var emptyDiv = document.createElement('div');
                                emptyDiv.classList.add('event', 'empty');
                                emptyDiv.dataset.startTime = (7 + Math.floor((row - 1) / 2)) + ':' + ((row - 1) % 2) * 30;
                                dayColumn.appendChild(emptyDiv);
                            }
                        }
                    });
                } else {
                    alert(data.message);
                }
            });
    }
});
