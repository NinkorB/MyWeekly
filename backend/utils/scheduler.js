// Helper to get the start of the current week (Monday)
function getStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // Reset time to midnight
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

function scheduleWeeklyTasks(weeklyTasks, user) {
    const generatedTasks = [];
    // Initialize daily slots based on user's settings
    const dailySlots = Array(7).fill(user.dayStartTime || 9); 

    weeklyTasks.forEach(template => {
        for (let i = 1; i <= 7; i++) { // Monday = 1, ..., Sunday = 7
            const day = i;
            let startTime, endTime;

            if (template.automate) {
                // Automated Scheduling
                let availableTime = dailySlots[i-1];
                const dayEnd = user.dayEndTime || 21;

                if (template.preferredSlots.length === 3) { // All slots selected
                    startTime = availableTime;
                    endTime = dayEnd;
                } else {
                    // This is a simplified logic. A real app might have more complex slot fitting.
                    startTime = availableTime;
                    endTime = startTime + template.duration;
                }

                if (endTime > dayEnd) continue; // Skip if task doesn't fit

                dailySlots[i-1] = endTime; // Update next available slot

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
    if (hour >= 24) hour = hour % 24; // Handle times past midnight
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${ampm}`;
}

module.exports = { scheduleWeeklyTasks, getStartOfWeek };
