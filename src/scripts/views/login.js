// src/scripts/views/login.js
import AppBar from '../components/app-bar';
import Auth from '../utils/auth';
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

const Login = {
    async render() {
        return `
        <div class="login-container">
            <h2>Welcome Back!</h2>
            <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Enter your password" required>
            </div>
            <div class="form-message" id="loginMessage"></div>
            <button type="submit" class="btn">Login</button>
            </form>
            <p>Belum punya akun? <a href="#/register">Register disini</a></p>
        </div>
        `;
    },

    async afterRender() {
        const loginForm = document.querySelector('#loginForm');
        const loginMessage = document.querySelector('#loginMessage');

        loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        
        try {
            loginMessage.textContent = 'Logging in...';
            console.log(`Attempting login with: ${email}`);
            
            const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            });
            
            const responseData = await response.json();
            console.log('Login response:', responseData);
            
            if (!responseData.error) {
            console.log('Received token:', responseData.loginResult.token);
            
            Auth.setToken(responseData.loginResult.token);
            console.log('Token saved, redirecting to home');
            
            window.location.hash = '#/';
            window.location.reload(); 
            } else {
            loginMessage.textContent = responseData.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.textContent = 'Cannot login. Please try again later.';
        }
        });
    },
};

export default Login;