(function() {
    // Authentication and Route Protection Class
    class SPAAuth {
      constructor() {
        this.protectedRoutes = [];
        this.initializeAuth();
      }
  
      // Initialize authentication
      initializeAuth() {
        // Fetch protected routes from server
        this.fetchProtectedRoutes()
          .then(() => this.setupRouteProtection())
          .catch(error => {
            console.error('Failed to set up route protection:', error);
          });
      }
  
      // Fetch protected routes from server
      async fetchProtectedRoutes() {
        try {
          const response = await fetch('/api/protected-routes');
          if (!response.ok) {
            throw new Error('Failed to fetch protected routes');
          }
          this.protectedRoutes = await response.json();
        } catch (error) {
          console.error('Error fetching protected routes:', error);
          this.protectedRoutes = [];
        }
      }
  
      // Setup route protection
      setupRouteProtection() {
        // Store original pushState and replaceState methods
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
  
        // Override pushState
        history.pushState = function(state, title, url) {
          const result = originalPushState.apply(this, arguments);
          window.dispatchEvent(new Event('pushstate'));
          return result;
        };
  
        // Override replaceState
        history.replaceState = function(state, title, url) {
          const result = originalReplaceState.apply(this, arguments);
          window.dispatchEvent(new Event('replacestate'));
          return result;
        };
  
        // Check route protection on navigation events
        const checkRouteProtection = () => {
          const currentPath = window.location.pathname;
          const isProtectedRoute = this.protectedRoutes.some(route => 
            currentPath.startsWith(route)
          );
  
          // Check authentication for protected routes
          if (isProtectedRoute) {
            const token = localStorage.getItem('auth_token');
            
            if (!token) {
              // Redirect to login if not authenticated
              window.history.replaceState(null, '', '/login');
              window.location.href = '/login';
              return false;
            }
          }
  
          return true;
        };
  
        // Add event listeners for route changes
        window.addEventListener('pushstate', checkRouteProtection);
        window.addEventListener('replacestate', checkRouteProtection);
        window.addEventListener('popstate', checkRouteProtection);
  
        // Initial page load check
        checkRouteProtection();
      }
  
      // Login method
      async login(email, password) {
        try {
          const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
  
          const data = await response.json();
  
          if (response.ok) {
            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            
            // Redirect to dashboard or home
            window.location.href = '/dashboard';
            
            return data;
          } else {
            throw new Error(data.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      }
  
      // Logout method
      logout() {
        // Remove token
        localStorage.removeItem('auth_token');
        
        // Redirect to login
        window.location.href = '/login';
      }
  
      // Check if user is authenticated
      isAuthenticated() {
        return !!localStorage.getItem('auth_token');
      }
    }
  
    // Initialize the authentication system when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Expose the authentication instance globally
      window.spaAuth = new SPAAuth();
    });
  })();