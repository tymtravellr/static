(function() {
    // Configuration for protected routes
    const PROTECTED_ROUTES = [
        '/dashboard',
        '/admin',
        '/settings',
        '/account'
    ];

    // Authentication Checker
    const AuthChecker = {
        // Check if current page is protected
        isProtectedRoute: function() {
            const currentPath = window.location.pathname;
            return PROTECTED_ROUTES.some(route => 
                currentPath.startsWith(route)
            );
        },

        // Validate authentication token
        isAuthenticated: function() {
            const token = localStorage.getItem('auth_token');
            
            if (!token) return false;

            try {
                // Basic JWT token validation
                const payload = this.decodeToken(token);
                
                // Check token expiration
                return payload.exp * 1000 > Date.now();
            } catch(e) {
                return false;
            }
        },

        // Decode JWT token payload
        decodeToken: function(token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace('-', '+').replace('_', '/');
                return JSON.parse(window.atob(base64));
            } catch(e) {
                return null;
            }
        },

        // Redirect to login page
        redirectToLogin: function() {
            // Preserve current path for potential post-login redirect
            const currentPath = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?redirect=${currentPath}`;
        },

        // Main authentication check
        checkAccess: function() {
            if (this.isProtectedRoute() && !this.isAuthenticated()) {
                this.redirectToLogin();
            }
        }
    };

    // Run authentication check when page loads
    window.addEventListener('DOMContentLoaded', () => {
        AuthChecker.checkAccess();
    });

    // Optional: Expose for manual checks if needed
    window.AuthChecker = AuthChecker;
})();