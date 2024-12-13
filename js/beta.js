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

        // Monkey patch history methods to intercept route changes
        patchHistoryMethods: function() {
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            const self = this;

            history.pushState = function() {
                originalPushState.apply(history, arguments);
                self.checkAccess();
            };

            history.replaceState = function() {
                originalReplaceState.apply(history, arguments);
                self.checkAccess();
            };

            // Intercept popstate for back/forward navigation
            window.addEventListener('popstate', () => {
                self.checkAccess();
            });
        },

        // Main authentication check
        checkAccess: function() {
            if (this.isProtectedRoute() && !this.isAuthenticated()) {
                this.redirectToLogin();
            }
        },

        // Initialize protection
        init: function() {
            // Initial check
            this.checkAccess();
            
            // Patch history methods for SPA routing
            this.patchHistoryMethods();
        }
    };

    // Run authentication check when page loads
    window.addEventListener('DOMContentLoaded', () => {
        AuthChecker.init();
    });

    // Optional: Expose for manual checks if needed
    window.AuthChecker = AuthChecker;
})();