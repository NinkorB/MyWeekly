function scheduleWeeklyTasks(weeklyTasks, user) {
    const generatedTasks = [];
    // Initialize daily slots based on user's settings
    const dailySlots = Array(7).fill(user.dayStartTime || 9); 

    weeklyTasks.forEach(template => {
        for (let i = 0; i < 7; i++) { // For each day of the week
            const day = (i + 1) % 7; // Monday is 1, Sunday is 0
            let startTime, endTime;

            if (template.automate) {
                // Automated Scheduling
                let availableTime = dailySlots[day];
                const dayEnd = user.dayEndTime || 21;

                if (template.preferredSlots.length === 3) { // All slots selected
                    startTime = availableTime;
                    endTime = dayEnd;
                } else {
              
                    startTime = availableTime;
                    endTime = startTime + template.duration;
                }

                if (endTime > dayEnd) continue; 

                dailySlots[day] = endTime; 

            } else {
                // Manual Scheduling
                if (template.startTime === null || template.startTime === undefined) continue;
                startTime = template.startTime;
                endTime = startTime + template.duration;
            }
            
            generatedTasks.push({
                title: template.title,
                time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
                link: template.link,
                dayOfWeek: day,
                templateId: template._id
            });
        }
    });

    return generatedTasks;
}

function formatTime(hour) {
    if (hour >= 24) hour = hour % 24; 
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${ampm}`;
}

module.exports = { scheduleWeeklyTasks };
