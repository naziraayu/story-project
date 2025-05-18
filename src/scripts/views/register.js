// src/scripts/views/register.js
const API_BASE_URL = 'https://story-api.dicoding.dev/v1';

const Register = {
    async render() {
        return `
            <div class="register-container">
                <h2>Create an Account</h2>
                <form id="registerForm">
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Enter your name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" placeholder="Create a password" minlength="6" required>
                </div>
                <div class="form-message" id="registerMessage"></div>
                <button type="submit" class="btn">Register</button>
                </form>
                <p>Sudah punya akun? <a href="#/login">Login disini</a></p>
            </div>
        `;
    },

    async afterRender() {
        const registerForm = document.querySelector('#registerForm');
        const registerMessage = document.querySelector('#registerMessage');

        registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;
        
        try {
            registerMessage.textContent = 'Registering...';
            
            const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
            });
            
            const responseData = await response.json();
            console.log('Register response:', responseData);
            
            if (!responseData.error) {
            registerMessage.textContent = 'Registration successful! Redirecting to login...';
            
            setTimeout(() => {
                window.location.hash = '#/login';
            }, 1500);
            } else {
            registerMessage.textContent = responseData.message || 'Registration failed. Please try again.';
            }
        } catch (error) {
            console.error('Register error:', error);
            registerMessage.textContent = 'Cannot register. Please try again later.';
        }
        });
    },
};

export default Register;