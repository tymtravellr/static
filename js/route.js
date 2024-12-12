function createRouteProtectionMiddleware() {
    // Define your protected routes
    const protectedPaths = ['/dashboard', '/profile'];

    // Function to check authentication status
    // Replace this with your actual authentication check
    function isAuthenticated() {
        // Example: Check for an auth token in localStorage
        const authenticated = !!localStorage.getItem('authToken');
        console.log(`[Route Protection] Authentication check: ${authenticated ? 'Authenticated' : 'Not Authenticated'}`);
        return authenticated;
    }

    // Middleware to intercept route changes
    function routeProtectionMiddleware(currentRouteId, setCurrentRouteId) {
        return (routeId, localeId, hash, pathVariables, isInitialLoad, isPopState) => {
            // Find the current route's path
            const currentRoute = window.__routes?.find(route => route.id === routeId);
            const currentPath = currentRoute?.path || '';

            console.log(`[Route Protection] Attempting to navigate to route:`, {
                routeId,
                path: currentPath,
                localeId,
                hash
            });

            // Check if the current route is a protected path
            const isProtectedPath = protectedPaths.some(protectedPath =>
                currentPath.includes(protectedPath)
            );

            // If it's a protected path and not authenticated, redirect to login
            if (isProtectedPath && !isAuthenticated()) {
                console.warn(`[Route Protection] Accessing protected route without authentication. Redirecting to login.`);

                // Find the login route
                const loginRoute = window.__routes?.find(route =>
                    route.path.includes('/login')
                );

                if (loginRoute) {
                    console.log(`[Route Protection] Redirecting to login route:`, loginRoute);

                    // Use Framer's routing mechanism to navigate to login
                    setCurrentRouteId(
                        loginRoute.id,
                        localeId,
                        hash,
                        pathVariables,
                        isInitialLoad,
                        isPopState
                    );
                    return false; // Prevent original navigation
                } else {
                    console.error(`[Route Protection] No login route found. Falling back to window redirect.`);
                    // Fallback to window redirect if no login route found
                    window.location.href = '/login';
                    return false;
                }
            }

            // Continue with normal route navigation
            return setCurrentRouteId(
                routeId,
                localeId,
                hash,
                pathVariables,
                isInitialLoad,
                isPopState
            );
        };
    }

    // Patch the setCurrentRouteId method
    function patchRouteNavigation() {
        if (window.__setCurrentRouteId) {
            console.log('[Route Protection] Patching route navigation middleware');
            const originalSetCurrentRouteId = window.__setCurrentRouteId;
            window.__setCurrentRouteId = routeProtectionMiddleware(
                window.__currentRouteId,
                originalSetCurrentRouteId
            );
        } else {
            console.warn('[Route Protection] Could not patch route navigation - __setCurrentRouteId not found');
        }
    }

    // Initialize the middleware
    function initialize() {
        console.log('[Route Protection] Initializing route protection middleware');

        // Use MutationObserver to wait for Framer's routing to be fully loaded
        const observer = new MutationObserver((mutations, obs) => {
            if (window.__setCurrentRouteId) {
                console.log('[Route Protection] Framer routing detected. Applying middleware.');
                patchRouteNavigation();
                obs.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // Public API
    return {
        initialize
    };
}