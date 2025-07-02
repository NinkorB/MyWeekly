// Helper to get the start of the current week (Monday)
function getStartOfWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function scheduleWeeklyTasks(weeklyTasks, user) {
    const generatedTasks = [];
    const dailySlots = Array(7).fill(user.dayStartTime || 9); 
    weeklyTasks.forEach(template => {
        for (let i = 1; i <= 7; i++) {
            const day = i;
            let startTime, endTime;
            if (template.automate) {
                let availableTime = dailySlots[i-1];
                const dayEnd = user.dayEndTime || 21;
                if (template.preferredSlots.length === 3) {
                    startTime = availableTime;
                    endTime = dayEnd;
                } else {
                    startTime = availableTime;
                    endTime = startTime + template.duration;
                }
                if (endTime > dayEnd) continue;
                dailySlots[i-1] = endTime;
            } else {
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

module.exports = { scheduleWeeklyTasks, getStartOfWeek };
