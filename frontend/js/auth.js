function authComponent() {
    return {
        view: 'login', // 'login', 'register', 'forgot'
        form: { username: '', password: '', githubUrl: '', fullName: '' },
        error: '',
        forgotPassword: { 
            view: 'check', 
            form: { username: '', fullName: '', link: '' }, 
            token: null, 
            checkToken: '', 
            status: '', 
            adminResponse: '', 
            newPassword: '' 
        },
        passwordForm: { currentPassword: '', newPassword: '', message: '', success: false },

        async login() {
            try {
                this.error = '';
                const data = await Alpine.store('main').apiCall('/api/auth/login', 'POST', this.form);
                Alpine.store('main').setAuthData(data);
                this.resetForms();
            } catch (err) {
                this.error = err.message;
            }
        },

        async register() {
            try {
                this.error = '';
                const data = await Alpine.store('main').apiCall('/api/auth/register', 'POST', this.form);
                Alpine.store('main').setAuthData(data);
                this.resetForms();
            } catch (err) {
                this.error = err.message;
            }
        },

        async submitForgotPassword() {
            try {
                const data = await Alpine.store('main').apiCall('/api/auth/forgot-password', 'POST', this.forgotPassword.form);
                this.forgotPassword.token = data.token;
            } catch (err) {
                alert(err.message);
            }
        },

        async checkResetStatus() {
            try {
                if (!this.forgotPassword.checkToken) {
                    alert('Please enter a token.');
                    return;
                }
                const data = await Alpine.store('main').apiCall(`/api/auth/reset-status/${this.forgotPassword.checkToken}`);
                this.forgotPassword.status = data.status;
                this.forgotPassword.adminResponse = data.adminResponse;
                if (data.status === 'Approved') {
                    this.forgotPassword.newPassword = data.newPassword;
                }
            } catch (err) {
                this.forgotPassword.status = 'Invalid';
                this.forgotPassword.adminResponse = 'Token not found or invalid.';
            }
        },

        async changePassword() {
            try {
                const data = await Alpine.store('main').apiCall('/api/auth/change-password', 'PUT', this.passwordForm);
                this.passwordForm.message = data.msg;
                this.passwordForm.success = true;
                this.passwordForm.currentPassword = '';
                this.passwordForm.newPassword = '';
            } catch (err) {
                this.passwordForm.message = err.message;
                this.passwordForm.success = false;
            }
        },

        async init() {
            const token = localStorage.getItem('myweekly_token');
            if (token) {
                Alpine.store('main').auth.token = token;
                try {
                    const data = await Alpine.store('main').apiCall('/api/auth/verify', 'POST');
                    Alpine.store('main').setAuthData(data);
                } catch (error) {
                    Alpine.store('main').logout();
                }
            }
        },

        resetForms() {
            this.form = { username: '', password: '', githubUrl: '', fullName: '' };
            this.error = '';
        }
    };
}
