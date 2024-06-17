document.addEventListener('DOMContentLoaded', function () {
    fetch('/index.php?action=current_week')
        .then(response => response.json())
        .then(data => {
            const dates = data.dates;
            const interval_count = data.interval_count;
            const start_time = data.start_time;
            const end_time = data.end_time;
            const appointments = data.appointments;

            document.documentElement.style.setProperty('--numHours', interval_count);

            populateCalendar(dates, interval_count, start_time, end_time, appointments);
        })
        .catch(error => console.error('Error fetching current week:', error));
});

function populateCalendar(dates, interval_count, start_time, end_time, appointments) {
    const daysOfWeek = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
    const calendarContainer = document.querySelector('.calendar .days');
    const timelineContainer = document.querySelector('.calendar .timeline');

    const startHour = parseInt(start_time.split(':')[0]);
    const endHour = parseInt(end_time.split(':')[0]);
    const endMinute = parseInt(end_time.split(':')[1]);

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
        dateElement.innerHTML = `<p class="date-day">1<br>${daysOfWeek[index]}</p>`;
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
            appointment.start,
            appointment.end,
            appointment.date,
            appointment.text,
            appointment.bgColor,
            start_time
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

function createAppointment(startTime, endTime, date, text, bgColor, start_time) {
    const startHour = parseInt(startTime.split(':')[0]);
    const startMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);

    const startHourGlobal = parseInt(start_time.split(':')[0]);
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
        eventElement.innerHTML = `<p class="title">${text}</p><p class="time">${startTime} - ${endTime}</p>`;
        eventElement.style.backgroundColor = bgColor;

        eventElement.style.gridRowStart = startRow;
        eventElement.style.gridRowEnd = endRow;

        const eventsContainer = targetDay.querySelector('.events');
        eventsContainer.appendChild(eventElement);

        let occupiedCells = targetDay.dataset.occupiedCells ? targetDay.dataset.occupiedCells.split(',') : [];
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
                const time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
                occupiedCells.push(time);
            }
        }
        targetDay.dataset.occupiedCells = occupiedCells.join(',');
    } else {
        console.error('Target day not found:', date);
    }
}

function openModal(startTime, date) {
    console.log('Start Time:', startTime);
    console.log('Date:', date);
    alert('Clicked on ' + startTime + ' on ' + date);
}
