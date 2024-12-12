class Auth {
    constructor(siteId) {
      this.siteId = siteId;
      this.storagePrefix = 'auth_';
    }
  
    // Local Storage Wrapper
    _setItem(key, value) {
      localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(value));
    }
  
    _getItem(key) {
      const item = localStorage.getItem(`${this.storagePrefix}${key}`);
      return item ? JSON.parse(item) : null;
    }
  
    _removeItem(key) {
      localStorage.removeItem(`${this.storagePrefix}${key}`);
    }
  
    // Authentication Methods
    async signup(email, password, license = 'basic') {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, license })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Signup failed');
        }
  
        this._setItem('token', data.token);
        this._setItem('user', data.user);
  
        return data;
      } catch (error) {
        console.error('Signup error:', error);
        throw error;
      }
    }
  
    async login(email, password) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }
  
        this._setItem('token', data.token);
        this._setItem('user', data.user);
  
        return data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
  
    logout() {
      this._removeItem('token');
      this._removeItem('user');
      window.location.href = '/login';
    }
  
    getToken() {
      return this._getItem('token');
    }
  
    getUser() {
      return this._getItem('user');
    }
  
    // Site Configuration
    async getSiteConfig() {
      try {
        const response = await fetch(`/api/site/${this.siteId}`);
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch site configuration');
        }
  
        return data;
      } catch (error) {
        console.error('Site config error:', error);
        throw error;
      }
    }
  
    // Page Access Control
    async checkPageAccess(path) {
      try {
        const siteConfig = await this.getSiteConfig();
        const token = this.getToken();
        
        if (!token) {
          return { allowed: false, redirectTo: '/login' };
        }
  
        const response = await fetch(path, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
  
        if (!response.ok) {
          const allowedPage = siteConfig.allowedPages.find(p => p.path === path);
          return { 
            allowed: false, 
            redirectTo: allowedPage ? siteConfig.accessDeniedPath : '/login' 
          };
        }
  
        return { allowed: true };
      } catch (error) {
        console.error('Page access error:', error);
        return { allowed: false, redirectTo: '/login' };
      }
    }
  }
  
  // Export or make available globally
  window.Auth = Auth;