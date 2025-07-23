function manageTasksComponent() {
    return {
        weeklyTaskForm: { title: '', duration: null, link: '', automate: false, preferredSlots: [], startTime: null },
        timeSlots: ['Morning', 'Afternoon', 'Evening'],
        settingsForm: { 
            dayStartTime: Alpine.store('main').user.dayStartTime, 
            dayEndTime: Alpine.store('main').user.dayEndTime 
        },

        async addWeeklyTask() {
            try {
                const data = await Alpine.store('main').apiCall('/api/tasks/weekly', 'POST', this.weeklyTaskForm);
                Alpine.store('main').user.weeklyTasks = data.weeklyTasks;
                Alpine.store('main').user.tasks = data.tasks;
                this.weeklyTaskForm = { title: '', duration: null, link: '', automate: false, preferredSlots: [], startTime: null };
            } catch (error) { 
                console.error("Failed to add weekly task:", error); 
                Alpine.store('main').showNotification('Error adding task.');
            }
        },

        async deleteWeeklyTask(taskId) {
            if (confirm('Are you sure you want to delete this weekly task template?')) {
                try {
                    const data = await Alpine.store('main').apiCall(`/api/tasks/weekly/${taskId}`, 'DELETE');
                    Alpine.store('main').user.weeklyTasks = data.weeklyTasks;
                    Alpine.store('main').user.tasks = data.tasks;
                } catch (error) { 
                    console.error("Failed to delete weekly task:", error); 
                    Alpine.store('main').showNotification('Error deleting task.');
                }
            }
        },

        async updateDaySettings() {
            try {
                const data = await Alpine.store('main').apiCall('/api/auth/settings', 'PUT', this.settingsForm);
                Alpine.store('main').user.dayStartTime = data.dayStartTime;
                Alpine.store('main').user.dayEndTime = data.dayEndTime;
                Alpine.store('main').user.tasks = data.tasks;
                Alpine.store('main').showNotification('Settings saved and schedule regenerated!');
            } catch (error) {
                console.error("Failed to update settings:", error);
                Alpine.store('main').showNotification('Failed to save settings.');
            }
        }
    };
}
