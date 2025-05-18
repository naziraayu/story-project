// src/scripts/utils/auth.js
const Auth = {
    TOKEN_KEY: 'user_token',
    
    setToken(token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    },
    
    getToken() {
      return localStorage.getItem(this.TOKEN_KEY);
    },
    
    removeToken() {
      localStorage.removeItem(this.TOKEN_KEY);
    },
    
    isLoggedIn() {
      return !!this.getToken();
    },
  };
  
  
export default Auth;