(function() {
    class SPAAuth {
      constructor() {
        console.log('🔐 SPAAuth: Initializing authentication system');
        this.protectedRoutes = [];
        
        // Patch history methods to trigger route checks
        this.patchHistoryMethods();
        
        this.initializeAuth();
      }
  
      // Patch history methods to trigger route checks
      patchHistoryMethods() {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        const self = this;
  
        history.pushState = function() {
          const result = originalPushState.apply(this, arguments);
          self.checkRouteAccess();
          return result;
        };
  
        history.replaceState = function() {
          const result = originalReplaceState.apply(this, arguments);
          self.checkRouteAccess();
          return result;
        };
  
        // Add event listener for popstate (back/forward navigation)
        window.addEventListener('popstate', () => this.checkRouteAccess());
      }
  
      // Initialize authentication
      initializeAuth() {
        this.fetchProtectedRoutes()
          .then(() => {
            console.log('🌐 SPAAuth: Protected routes loaded:', this.protectedRoutes);
            this.checkRouteAccess();
          })
          .catch(error => {
            console.error('❌ SPAAuth: Failed to set up route protection:', error);
          });
      }
  
      // Fetch protected routes from server
      async fetchProtectedRoutes() {
        try {
          console.log('🔍 SPAAuth: Fetching protected routes...');
          const response = await fetch('https://biteauth.vercel.app/api/protected-routes');
          if (!response.ok) {
            throw new Error('Failed to fetch protected routes');
          }
          this.protectedRoutes = await response.json();
        } catch (error) {
          console.error('❌ SPAAuth: Error fetching protected routes:', error);
          this.protectedRoutes = [];
        }
      }
  
      // Check route access
      checkRouteAccess() {
        const currentPath = window.location.pathname;
        console.log(`📍 SPAAuth: Checking access for current path: ${currentPath}`);
  
        const isProtectedRoute = this.protectedRoutes.some(route => 
          currentPath.startsWith(route)
        );
  
        // Check authentication for protected routes
        if (isProtectedRoute) {
          const token = localStorage.getItem('auth_token');
          
          console.log(`🔒 SPAAuth: Route is protected. Token exists: ${!!token}`);
          
          if (!token) {
            console.warn('🚫 SPAAuth: Unauthorized access. Redirecting to login.');
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return false;
          }
        } else {
          console.log('🟢 SPAAuth: Current route is not protected.');
        }
  
        return true;
      }
  
      // Login method
      async login(email, password) {
        try {
          console.log('🔑 SPAAuth: Attempting login...');
          const response = await fetch('https://biteauth.vercel.app/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
  
          const data = await response.json();
  
          if (response.ok) {
            console.log('✅ SPAAuth: Login successful');
            // Store token in localStorage
            localStorage.setItem('auth_token', data.token);
            
            // Redirect to dashboard or home
            window.location.href = '/dashboard';
            
            return data;
          } else {
            console.error('❌ SPAAuth: Login failed');
            throw new Error(data.message || 'Login failed');
          }
        } catch (error) {
          console.error('❌ SPAAuth: Login error:', error);
          throw error;
        }
      }
  
      // Logout method
      logout() {
        console.log('🚪 SPAAuth: Logging out');
        // Remove token
        localStorage.removeItem('auth_token');
        
        // Redirect to login
        window.location.href = '/login';
      }
  
      // Check if user is authenticated
      isAuthenticated() {
        const isAuth = !!localStorage.getItem('auth_token');
        console.log(`🔐 SPAAuth: Authentication check - ${isAuth ? 'Authenticated' : 'Not Authenticated'}`);
        return isAuth;
      }
    }
  
    // Initialize the authentication system when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🌟 SPAAuth: DOM loaded. Initializing authentication...');
      // Expose the authentication instance globally
      window.spaAuth = new SPAAuth();
    });
  })();