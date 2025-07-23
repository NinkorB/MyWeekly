document.addEventListener('alpine:init', () => {
    Alpine.store('main', {
        // --- State ---
        API_URL: 'https://myweekly.onrender.com', 
        currentPage: 'dashboard',
        auth: { 
            token: null, 
            username: null, 
            isAdmin: false, 
            solvedDSA: [] 
        },
        user: {
            tasks: [],
            weeklyTasks: [],
            history: [],
            reward: 'Enjoy 2 hours of guilt-free fun!',
            dayStartTime: 9,
            dayEndTime: 21
        },
        notification: { show: false, message: '' },

        // --- Core Methods ---
        async apiCall(endpoint, method = 'GET', body = null) {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            if (this.auth.token) {
                options.headers['Authorization'] = `Bearer ${this.auth.token}`;
            }
            if (body) {
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`${this.API_URL}${endpoint}`, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'An error occurred.');
            }
            return data;
        },

        setAuthData(data) {
            this.auth.token = data.token;
            this.auth.username = data.user.username;
            this.auth.isAdmin = data.user.isAdmin || false;
            this.auth.solvedDSA = data.user.solvedDSA || [];
            
            this.user.tasks = data.user.tasks || [];
            this.user.weeklyTasks = data.user.weeklyTasks || [];
            this.user.history = data.user.history || [];
            this.user.reward = data.user.reward || 'Enjoy 2 hours of guilt-free fun!';
            this.user.dayStartTime = data.user.dayStartTime || 9;
            this.user.dayEndTime = data.user.dayEndTime || 21;

            localStorage.setItem('myweekly_token', data.token);
            this.currentPage = 'dashboard';
        },

        logout() {
            this.auth = { token: null, username: null, isAdmin: false, solvedDSA: [] };
            this.user = { tasks: [], weeklyTasks: [], history: [], reward: '', dayStartTime: 9, dayEndTime: 21 };
            localStorage.removeItem('myweekly_token');
            this.currentPage = 'dashboard'; // Will trigger the login modal
        },

        showNotification(message) {
            this.notification.message = message;
            this.notification.show = true;
            setTimeout(() => {
                this.notification.show = false;
            }, 3000);
        },

        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        },

        getStartOfWeek(date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        }
    });
});
