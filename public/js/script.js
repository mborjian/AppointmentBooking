let scheduleConfig = {
    startTime: '06:00',
    endTime: '18:00'
};

document.addEventListener('DOMContentLoaded', function () {
    fetch('/index.php?action=current_week')
        .then(response => response.json())
        .then(data => {
            const dates = data.dates;
            const interval_count = data.interval_count;
            const appointments = data.appointments;

            scheduleConfig.startTime = data.start_time
            scheduleConfig.endTime = data.end_time

            document.documentElement.style.setProperty('--numHours', interval_count);

            populateCalendar(dates, interval_count, appointments);
        })
        .catch(error => console.error('Error fetching current week:', error));
});

function populateCalendar(dates, interval_count, appointments) {
    const daysOfWeek = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const calendarContainer = document.querySelector('.calendar .days');
    const timelineContainer = document.querySelector('.calendar .timeline');

    const startHour = parseInt(scheduleConfig.startTime.split(':')[0]);
    const endHour = parseInt(scheduleConfig.endTime.split(':')[0]);
    const endMinute = parseInt(scheduleConfig.endTime.split(':')[1]);

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
            const timeElement = document.createElement('div');
            timeElement.textContent = time;
            timelineContainer.appendChild(timeElement);

            if (hour === endHour && minute === endMinute) {
                break;
            }
        }
    }

    dates.forEach((date, index) => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.dataset.date = date;

        const dateElement = document.createElement('div');
        dateElement.classList.add('date');
        dateElement.innerHTML = `<p class="date-day">${convertGregorianToShamsi(date)}<br>${daysOfWeek[index]}</p>`;
        dayElement.appendChild(dateElement);

        const eventsContainer = document.createElement('div');
        eventsContainer.classList.add('events');
        dayElement.appendChild(eventsContainer);

        const occupiedCells = [];
        appointments.forEach(appointment => {
            if (appointment.date === date) {
                let currentHour = parseInt(appointment.start.split(':')[0]);
                let currentMinute = parseInt(appointment.start.split(':')[1]);
                const endHour = parseInt(appointment.end.split(':')[0]);
                const endMinute = parseInt(appointment.end.split(':')[1]);

                while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
                    const time = ('0' + currentHour).slice(-2) + ':' + ('0' + currentMinute).slice(-2);
                    occupiedCells.push(time);
                    currentMinute += 30;
                    if (currentMinute === 60) {
                        currentMinute = 0;
                        currentHour += 1;
                    }
                }
            }
        });

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
                if (hour === endHour && minute >= endMinute) {
                    break;
                }
                if (!occupiedCells.includes(time)) {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event', 'empty');
                    eventElement.dataset.time = time;
                    eventElement.dataset.date = date;
                    eventsContainer.appendChild(eventElement);
                }
            }
        }

        calendarContainer.appendChild(dayElement);
    });

    appointments.forEach(appointment => {
        createAppointment(
            appointment.id,
            appointment.start,
            appointment.end,
            appointment.date,
            appointment.text,
            appointment.bgColor
        );
    });

    const emptyEvents = document.querySelectorAll('.event.empty');
    emptyEvents.forEach(emptyEvent => {
        emptyEvent.addEventListener('click', function () {
            const startTime = emptyEvent.dataset.time;
            const date = emptyEvent.dataset.date;
            openModal(startTime, date);
        });
    });
}

function convertGregorianToShamsi(gregorianDate) {
    const gregorianParts = gregorianDate.split('').map(Number);
    const year = gregorianParts[0] * 1000 + gregorianParts[1] * 100 + gregorianParts[2] * 10 + gregorianParts[3];
    const month = gregorianParts[4] * 10 + gregorianParts[5];
    const day = gregorianParts[6] * 10 + gregorianParts[7];
    const d = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fa-IR').format(d);
}

function createAppointment(id, startTime, endTime, date, text, bgColor) {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    const startHourGlobal = parseInt(scheduleConfig.startTime.split(':')[0]);
    const startRow = (startHour - startHourGlobal) * 2 + (startMinute === 30 ? 1 : 0) + 1;
    const endRow = (endHour - startHourGlobal) * 2 + (endMinute === 30 ? 1 : 0) + 1;

    const days = document.querySelectorAll('.day');
    let targetDay = null;
    for (let i = 0; i < days.length; i++) {
        if (days[i].dataset.date === date) {
            targetDay = days[i];
            break;
        }
    }

    if (targetDay) {
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');
        eventElement.innerHTML = `<p class="title">${text}</p>`;
        eventElement.style.backgroundColor = bgColor;

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'X';
        cancelButton.classList.add('btn', 'btn-sm', 'btn-danger');
        cancelButton.addEventListener('click', function () {
            cancelAppointment(id, function (success) {
                if (success) {
                    eventElement.remove();
                    updateOccupiedCells(targetDay, startTime, endTime, false);
                } else {
                    alert('Error canceling appointment. Please try again later.');
                }
            });
        });

        eventElement.appendChild(cancelButton);

        eventElement.style.gridRowStart = startRow;
        eventElement.style.gridRowEnd = endRow;

        const eventsContainer = targetDay.querySelector('.events');

        eventElement.dataset.time = startTime;
        eventElement.dataset.date = date;

        eventsContainer.appendChild(eventElement);

        updateOccupiedCells(targetDay, startTime, endTime, true);
    } else {
        console.error('Target day not found:', date);
    }
}

function updateOccupiedCells(targetDay, startTime, endTime, add) {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    let occupiedCells = targetDay.dataset.occupiedCells ? targetDay.dataset.occupiedCells.split(',') : [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
            const time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
            if (add) {
                occupiedCells.push(time);
            } else {
                const index = occupiedCells.indexOf(time);
                if (index > -1) {
                    occupiedCells.splice(index, 1);
                }
            }
        }
    }
    targetDay.dataset.occupiedCells = occupiedCells.join(',');
}


function openModal(startTime, date) {
    document.getElementById('startTime').value = startTime;

    const durationSelect = document.getElementById('duration');
    durationSelect.innerHTML = '';

    const eventElements = document.querySelectorAll(`.event[data-date="${date}"]:not(.empty)`);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    let nextAppointmentTimeInMinutes = null;

    eventElements.forEach(eventElement => {
        const [eventHour, eventMinute] = eventElement.dataset.time.split(':').map(Number);
        const eventTimeInMinutes = eventHour * 60 + eventMinute;

        if (eventTimeInMinutes > startTimeInMinutes) {
            nextAppointmentTimeInMinutes = eventTimeInMinutes;
        }
    });

    let maxDuration = 0;
    const endOfDayInMinutes = parseInt(scheduleConfig.endTime.split(':')[0]) * 60 + parseInt(scheduleConfig.endTime.split(':')[1]);

    if (nextAppointmentTimeInMinutes !== null) {
        maxDuration = nextAppointmentTimeInMinutes - startTimeInMinutes;
    } else {
        maxDuration = endOfDayInMinutes - startTimeInMinutes;
    }

    for (let i = 1; i <= maxDuration / 30; i++) {
        const option = document.createElement('option');
        option.value = (i * 30).toString();
        option.textContent = i * 0.5 + ' hours';
        durationSelect.appendChild(option);
    }

    const modal = new bootstrap.Modal(document.getElementById('appointmentModal'));
    modal.show();

    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const duration = parseInt(durationSelect.value);
        const text = document.getElementById('text').value;

        if (!text.trim()) {
            alert('Please enter a description.');
            return;
        }

        const endTimeInMinutes = startTimeInMinutes + duration;
        const endHour = Math.floor(endTimeInMinutes / 60);
        const endMinute = endTimeInMinutes % 60;
        const endTime = ('0' + endHour).slice(-2) + ':' + ('0' + endMinute).slice(-2);

        const appointmentData = {
            start_time: startTime,
            end_time: endTime,
            text: text,
            date: date
        };

        fetch('/index.php?action=book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Appointment booked successfully:', data);
                modal.hide();
                window.location.reload();
            })
            .catch(error => {
                console.error('Error booking appointment:', error);
                alert('Error booking appointment. Please try again later.');
            });
    });
}


function cancelAppointment(appointmentID, callback) {
    console.log(appointmentID);

    fetch('/index.php?action=cancel', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({appointment_id: appointmentID}),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                console.log('Appointment canceled successfully:', data);
                callback(true);
            } else {
                console.error('Error canceling appointment:', data.message);
                callback(false);
            }
        })
        .catch(error => {
            console.error('Error canceling appointment:', error);
            callback(false);
        });
}