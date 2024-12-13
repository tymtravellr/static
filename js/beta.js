(function () {
    // Configuration for protected routes
    const PROTECTED_ROUTES = [
        '/dashboard',
        '/admin',
        '/settings',
        '/account'
    ];
    console.log("script is working")
    const AuthChecker = {
        // Check if current page is protected
        isProtectedRoute: function () {
            const currentPath = window.location.pathname;
            return PROTECTED_ROUTES.some(route =>
                currentPath.startsWith(route)
            );
        },


        // Validate authentication token
        isAuthenticated: function () {
            const token = localStorage.getItem('auth_token');

            if (!token) return false;

            try {
                // Basic JWT token validation
                const payload = this.decodeToken(token);

                // Check token expiration
                return payload.exp * 1000 > Date.now();
            } catch (e) {
                return false;
            }
        },

        // Decode JWT token payload
        decodeToken: function (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace('-', '+').replace('_', '/');
                return JSON.parse(window.atob(base64));
            } catch (e) {
                return null;
            }
        },

        // Redirect to login page
        redirectToLogin: function () {
            const currentPath = encodeURIComponent(window.location.pathname);
            window.location.href = `/login?redirect=${currentPath}`;
        },

        // Immediate and aggressive authentication check
        checkAccessNow: function () {
            // Immediate check on page load
            if (this.isProtectedRoute() && !this.isAuthenticated()) {
                this.redirectToLogin();
                return false;
            }
            return true;
        },

        // Comprehensive navigation interception
        interceptNavigation: function () {
            const self = this;

            // Override all potential navigation methods
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;

            history.pushState = function (...args) {
                const [state, title, url] = args;

                // Check if the new route is protected
                const tempAnchor = document.createElement('a');
                tempAnchor.href = url || window.location.href;

                if (self.isProtectedRoute(tempAnchor.pathname) && !self.isAuthenticated()) {
                    self.redirectToLogin();
                    return;
                }

                originalPushState.apply(history, args);
            };

            history.replaceState = function (...args) {
                const [state, title, url] = args;

                // Check if the new route is protected
                const tempAnchor = document.createElement('a');
                tempAnchor.href = url || window.location.href;

                if (self.isProtectedRoute(tempAnchor.pathname) && !self.isAuthenticated()) {
                    self.redirectToLogin();
                    return;
                }

                originalReplaceState.apply(history, args);
            };

            // Intercept all navigation events
            const originalAddEventListener = window.addEventListener;
            window.addEventListener = function (type, listener, options) {
                if (type === 'popstate') {
                    const wrappedListener = function (event) {
                        if (self.isProtectedRoute() && !self.isAuthenticated()) {
                            self.redirectToLogin();
                            return;
                        }
                        listener.call(this, event);
                    };
                    originalAddEventListener.call(window, type, wrappedListener, options);
                } else {
                    originalAddEventListener.call(window, type, listener, options);
                }
            };
        },

        // Initialize protection
        init: function () {
            // Immediate check
            this.checkAccessNow();

            // Intercept all navigation methods
            this.interceptNavigation();

            // Additional check for any async route changes
            const originalFetch = window.fetch;
            window.fetch = function (...args) {
                const [url] = args;
                const tempAnchor = document.createElement('a');
                tempAnchor.href = url;

                if (self.isProtectedRoute(tempAnchor.pathname) && !self.isAuthenticated()) {
                    self.redirectToLogin();
                    return Promise.reject(new Error('Unauthorized'));
                }

                return originalFetch.apply(this, args);
            };
        }
    };

    // Run authentication check immediately
    AuthChecker.init();
    console.log("auth is running")
    // Expose for manual checks if needed
    window.AuthChecker = AuthChecker;
})();