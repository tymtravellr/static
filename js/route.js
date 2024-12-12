// Early Route Protection Middleware
(function() {
    // Configuration
    const protectedPaths = ['/dashboard', '/profile'];
  
    // Authentication check function (customize this)
    function isAuthenticated() {
      const authenticated = !!localStorage.getItem('authToken');
      console.log(`[Early Route Protection] Authentication check: ${authenticated ? 'Authenticated' : 'Not Authenticated'}`);
      return authenticated;
    }
  
    // Early route protection
    function earlyRouteProtection() {
      console.log('[Early Route Protection] Checking route access');
  
      // Get current path from window location
      const currentPath = window.location.pathname;
      console.log(`[Early Route Protection] Current path: ${currentPath}`);
  
      // Check if current path is protected
      const isProtectedPath = protectedPaths.some(protectedPath => 
        currentPath.includes(protectedPath)
      );
  
      console.log(`[Early Route Protection] Is protected path: ${isProtectedPath}`);
  
      // If protected path and not authenticated, redirect early
      if (isProtectedPath && !isAuthenticated()) {
        console.warn('[Early Route Protection] Blocking access to protected route');
        
        // Immediate redirect using window.location
        console.log('[Early Route Protection] Redirecting to login page');
        window.location.replace('/login');
        
        // Prevent any further script execution
        return false;
      }
  
      console.log('[Early Route Protection] Route access allowed');
      return true;
    }
  
    // Multiple interception points
    function interceptFramerNavigation() {
      // Patch Framer's internal route methods if available
      if (window.__setCurrentRouteId) {
        console.log('[Early Route Protection] Patching Framer route navigation');
        
        const originalSetCurrentRouteId = window.__setCurrentRouteId;
        
        window.__setCurrentRouteId = function(...args) {
          console.log('[Early Route Protection] Intercepting route change', args);
          
          if (earlyRouteProtection() === false) {
            console.warn('[Early Route Protection] Blocked route change');
            return;
          }
          
          return originalSetCurrentRouteId.apply(this, args);
        };
      } else {
        console.warn('[Early Route Protection] Could not find Framer route navigation method');
      }
    }
  
    // Proactive protection mechanisms
    function setupEarlyProtection() {
      console.log('[Early Route Protection] Setting up early protection mechanisms');
  
      // Check protection on initial load
      if (earlyRouteProtection() === false) {
        return;
      }
  
      // Patch history.pushState
      const originalPushState = history.pushState;
      history.pushState = function(state, title, url) {
        console.log('[Early Route Protection] Intercepting pushState', { state, title, url });
        
        if (earlyRouteProtection() === false) {
          console.warn('[Early Route Protection] Blocked pushState');
          return;
        }
        
        return originalPushState.apply(history, arguments);
      };
  
      // Patch history.replaceState
      const originalReplaceState = history.replaceState;
      history.replaceState = function(state, title, url) {
        console.log('[Early Route Protection] Intercepting replaceState', { state, title, url });
        
        if (earlyRouteProtection() === false) {
          console.warn('[Early Route Protection] Blocked replaceState');
          return;
        }
        
        return originalReplaceState.apply(history, arguments);
      };
  
      // Framer-specific navigation interception
      interceptFramerNavigation();
    }
  
    // Different initialization strategies to ensure early execution
    function initializeProtection() {
      console.log('[Early Route Protection] Initializing protection strategies');
  
      // Strategy 1: Immediate execution
      earlyRouteProtection();
  
      // Strategy 2: DOMContentLoaded fallback
      document.addEventListener('DOMContentLoaded', () => {
        console.log('[Early Route Protection] DOMContentLoaded trigger');
        earlyRouteProtection();
      });
  
      // Strategy 3: Load event fallback
      window.addEventListener('load', () => {
        console.log('[Early Route Protection] Window load trigger');
        earlyRouteProtection();
      });
    }
  
    // Initial log
    console.log('[Early Route Protection] Middleware script loaded');
    
    // Run initialization
    initializeProtection();
  })();