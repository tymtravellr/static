(function() {
    class SPAAuth {
      constructor() {
        this.protectedRoutes = [];
        this.initializeAuth();
      }
  
      // Initialize authentication
      initializeAuth() {
        this.fetchProtectedRoutes()
          .then(() => this.checkInitialRouteAccess())
          .catch(error => {
            console.error('Failed to set up route protection:', error);
          });
      }
  
      // Fetch protected routes from server
      async fetchProtectedRoutes() {
        try {
          const response = await fetch('https://biteauth.vercel.app/api/protected-routes');
          if (!response.ok) {
            throw new Error('Failed to fetch protected routes');
          }
          this.protectedRoutes = await response.json();
        } catch (error) {
          console.error('Error fetching protected routes:', error);
          this.protectedRoutes = [];
        }
      }
  
      // Check initial route access
      checkInitialRouteAccess() {
        const currentPath = window.location.pathname;
        const isProtectedRoute = this.protectedRoutes.some(route => 
          currentPath.startsWith(route)
        );
  
        // Check authentication for protected routes
        if (isProtectedRoute) {
          const token = localStorage.getItem('auth_token');
          
          if (!token) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return false;
          }
        }
  
        return true;
      }
  
      // Login method
      async login(email, password) {
        try {
          const response = await fetch('https://biteauth.vercel.app/auth/login', {
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