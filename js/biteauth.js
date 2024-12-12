function createAuth() {
    class Auth {
      constructor() {
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
      async signup(email, password) {
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
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
  
      // Simple page access check
      isAuthenticated() {
        return !!this.getToken();
      }
    }
  
    // Return an instance of Auth
    return new Auth();
  }
  
  // Usage examples:
  // Option 1: Global exposure
  window.auth = createAuth();