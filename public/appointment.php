<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
    <meta charset="UTF-8">
    <style>
        :root {
            --numHours: <?php echo 20;?>;
        }
    </style>

    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="calendar">
    <div class="timeline">
        <div class="spacer"></div>
        <?php
        for ($hour = 7; $hour <= 16; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $time = sprintf('%02d:%02d', $hour, $minute);
                echo '<div>' . $time . '</div>';
            }
        }
        ?>
    </div>
    <div class="days">
        <?php
        $daysOfWeek = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
        $dates = ['0615', '0616', '0617', '0618', '0619', '0620', '0621']; // Example dates (replace with actual dates)

        $appointments = [
            ['start' => '10:00', 'end' => '12:00', 'date' => '0617', 'text' => 'Corporate Finance', 'bgColor' => '#ffd6d1'],
            ['start' => '13:00', 'end' => '16:00', 'date' => '0618', 'text' => 'Entertainment Law', 'bgColor' => '#fafaa3'],
            ['start' => '11:00', 'end' => '12:00', 'date' => '0619', 'text' => 'Writing Seminar', 'bgColor' => '#e2f8ff'],
        ];

        foreach ($dates as $index => $date) {
            echo '<div class="day" data-date="' . $date . '">';
            echo '<div class="date">';
            echo '<p class="date-day">' . '1' . '<br>' . $daysOfWeek[$index] . '</p>';
            echo '</div>';
            echo '<div class="events">';

            $occupiedCells = [];

            foreach ($appointments as $appointment) {
                if ($appointment['date'] === $date) {
                    $startTime = $appointment['start'];
                    $endTime = $appointment['end'];

                    $startHour = intval(substr($startTime, 0, 2));
                    $startMinute = intval(substr($startTime, 3, 2));
                    $endHour = intval(substr($endTime, 0, 2));
                    $endMinute = intval(substr($endTime, 3, 2));

                    for ($hour = $startHour; $hour < $endHour; $hour++) {
                        for ($minute = ($hour === $startHour ? $startMinute : 0); $minute < 60; $minute += 30) {
                            $time = sprintf('%02d:%02d', $hour, $minute);
                            $occupiedCells[] = $time;
                        }
                    }
                }
            }

            for ($hour = 7; $hour <= 16; $hour++) {
                for ($minute = 0; $minute < 60; $minute += 30) {
                    $time = sprintf('%02d:%02d', $hour, $minute);

                    if (!in_array($time, $occupiedCells)) {
                        echo '<div class="event empty" data-time="' . $time . '" data-date="' . $date . '"></div>';
                    }
                }
            }

            echo '</div>';
            echo '</div>';
        }
        ?>
    </div>
</div>

<script>
    const appointments = <?php echo json_encode($appointments); ?>;

    function createAppointment(startTime, endTime, date, text, bgColor) {
        var startHour = parseInt(startTime.split(':')[0]);
        var startMinute = parseInt(startTime.split(':')[1]);
        var endHour = parseInt(endTime.split(':')[0]);
        var endMinute = parseInt(endTime.split(':')[1]);

        var startRow = (startHour - 7) * 2 + (startMinute === 30 ? 1 : 0) + 1; // Adjust for timeline start from 7 AM
        var endRow = (endHour - 7) * 2 + (endMinute === 30 ? 1 : 0) + 1;

        var days = document.querySelectorAll('.day');
        var targetDay = null;
        for (var i = 0; i < days.length; i++) {
            if (days[i].dataset.date === date) {
                targetDay = days[i];
                break;
            }
        }

        if (targetDay) {
            var eventElement = document.createElement('div');
            eventElement.classList.add('event');
            eventElement.innerHTML = '<p class="title">' + text + '</p>' +
                '<p class="time">' + startTime + ' - ' + endTime + '</p>';
            eventElement.style.backgroundColor = bgColor; // Set background color dynamically

            eventElement.style.gridRowStart = startRow;
            eventElement.style.gridRowEnd = endRow;

            var eventsContainer = targetDay.querySelector('.events');
            eventsContainer.appendChild(eventElement);

            var occupiedCells = targetDay.dataset.occupiedCells ? targetDay.dataset.occupiedCells.split(',') : [];
            for (var hour = startHour; hour < endHour; hour++) {
                for (var minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
                    var time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
                    occupiedCells.push(time);
                }
            }
            targetDay.dataset.occupiedCells = occupiedCells.join(',');
        } else {
            console.error('Target day not found:', date);
        }
    }

    var emptyEvents = document.querySelectorAll('.event.empty');

    emptyEvents.forEach(function (emptyEvent) {
        emptyEvent.addEventListener('click', function () {
            var startTime = emptyEvent.dataset.time;
            var date = emptyEvent.dataset.date;

            openModal(startTime, date);
        });
    });

    function openModal(startTime, date) {
        console.log('Start Time:', startTime);
        console.log('Date:', date);

        alert('Clicked on ' + startTime + ' on ' + date);
    }

    appointments.forEach(function (appointment) {
        createAppointment(appointment.start, appointment.end, appointment.date, appointment.text, appointment.bgColor);
    });
</script>

</body>
</html>
