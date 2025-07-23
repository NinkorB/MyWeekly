function adminComponent() {
    return {
        allUsers: [],
        passwordRequests: [],
        expandedUser: null,

        init() {
            // Load data when the component is initialized
            if (Alpine.store('main').currentPage === 'adminUsers') {
                this.getAdminUsers();
            }
            if (Alpine.store('main').currentPage === 'adminQueries') {
                this.getPasswordRequests();
            }
        },

        async getAdminUsers() {
            if (!Alpine.store('main').auth.isAdmin) return;
            try {
                this.allUsers = await Alpine.store('main').apiCall('/api/admin/users');
            } catch (error) {
                console.error("Failed to fetch admin data:", error);
                Alpine.store('main').currentPage = 'dashboard';
            }
        },

        async getPasswordRequests() {
            if (!Alpine.store('main').auth.isAdmin) return;
            try {
                this.passwordRequests = await Alpine.store('main').apiCall('/api/admin/password-requests');
            } catch (error) {
                console.error("Failed to fetch requests:", error);
            }
        },

        async handleResetRequest(req, status) {
            try {
                const body = { status, newPassword: req.newPassword, adminResponse: req.adminResponse };
                await Alpine.store('main').apiCall(`/api/admin/password-requests/${req._id}`, 'PUT', body);
                this.passwordRequests = this.passwordRequests.filter(r => r._id !== req._id);
            } catch (error) {
                alert('Failed to process request.');
            }
        }
    };
}
