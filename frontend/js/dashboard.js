function dashboardComponent() {
    return {
        get currentDate() { return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); },
        get currentDayName() { return new Date().toLocaleDateString('en-US', { weekday: 'long' }); },
        get isSunday() { return new Date().getDay() === 0; },
        
        get todaysTasks() {
            let dayIndex = new Date().getDay();
            if (dayIndex === 0) dayIndex = 7; // Sunday is 0, but in our system it's 7
            return Alpine.store('main').user.tasks
                .filter(task => task.dayOfWeek === dayIndex)
                .sort((a,b) => parseInt(a.time) - parseInt(b.time));
        },

        get currentWeekLog() {
            const startOfWeek = Alpine.store('main').getStartOfWeek(new Date());
            return Alpine.store('main').user.history.find(log => new Date(log.weekOf).getTime() === startOfWeek.getTime());
        },

        get progress() {
            const log = this.currentWeekLog;
            if (!log) {
                const completed = Alpine.store('main').user.tasks.filter(t => t.completed).length;
                const total = Alpine.store('main').user.tasks.length;
                const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                return { completed, total, percentage };
            }
            const percentage = log.totalTasks > 0 ? Math.round((log.tasksCompleted / log.totalTasks) * 100) : 0;
            return { completed: log.tasksCompleted, total: log.totalTasks, percentage };
        },

        getFormattedTaskTitle(task) {
            if (!task.link) return task.title;
            const githubRepoRegex = /https?:\/\/github\.com\/[^\/]+\/([^\/]+)\/?/;
            let match = task.link.match(githubRepoRegex);
            if (match && match[1]) {
                const repoName = match[1].replace(/-/g, ' ').replace(/_/g, ' ');
                return `${task.title}: ${repoName}`;
            }
            return task.title;
        },

        async toggleTask(task) {
            try {
                const data = await Alpine.store('main').apiCall(`/api/tasks/${task._id}/toggle`, 'PUT');
                Alpine.store('main').user.tasks = data.tasks;
                Alpine.store('main').user.history = data.history;
            } catch (error) { 
                console.error("Failed to toggle task:", error); 
                Alpine.store('main').showNotification('Error updating task.');
            }
        }
    };
}
