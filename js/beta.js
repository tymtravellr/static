(function() {
    // Configuration for protected routes
    const PROTECTED_ROUTES = [
        '/dashboard',
        '/admin',
        '/settings',
        '/account'
    ];

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

        // Initial and continuous authentication check
        checkAccess: function() {
            if (this.isProtectedRoute() && !this.isAuthenticated()) {
                this.redirectToLogin();
                return false;
            }
            return true;
        },

        // Intercept and modify navigation
        interceptNavigation: function() {
            // Override pushState to check authentication
            const originalPushState = history.pushState;
            history.pushState = (...args) => {
                const [state, title, url] = args;
                
                // Check if the new route is protected
                const tempAnchor = document.createElement('a');
                tempAnchor.href = url || window.location.href;
                
                if (this.isProtectedRoute(tempAnchor.pathname) && !this.isAuthenticated()) {
                    this.redirectToLogin();
                    return;
                }
                
                originalPushState.apply(history, args);
            };

            // Intercept popstate to re-check authentication
            const originalPopStateHandler = window.onpopstate;
            window.onpopstate = (event) => {
                if (!this.checkAccess()) {
                    return;
                }
                
                if (originalPopStateHandler) {
                    originalPopStateHandler.call(window, event);
                }
            };
        },

        // Initialize protection
        init: function() {
            // Immediate check
            if (!this.checkAccess()) return;

            // Intercept navigation methods
            this.interceptNavigation();
        }
    };

    // Run authentication check as early as possible
    AuthChecker.init();

    // Expose for manual checks if needed
    window.AuthChecker = AuthChecker;
})();