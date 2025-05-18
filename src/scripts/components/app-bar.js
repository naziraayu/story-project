// src/scripts/components/app-bar.js
import Auth from '../utils/auth';

const AppBar = {
    init() {
        this._renderAppBar();
    },

    _renderAppBar() {
        const isLoggedIn = Auth.isLoggedIn();
        console.log('Is logged in:', isLoggedIn);
        
        const navigationItems = isLoggedIn 
            ? `
                <ul>
                    <li><a href="#/" aria-label="home page">Home</a></li>
                    <li><a href="#/add" aria-label="add new story">Add Story</a></li>
                    <li><a href="#" id="logoutButton" aria-label="logout">Logout</a></li>
                </ul>
                ` 
                : `
                <ul>
                    <li><a href="#/login" aria-label="login">Login</a></li>
                    <li><a href="#/register" aria-label="register">Register</a></li>
                </ul>
            `;
        
        const navigationDrawer = document.querySelector('#navigationDrawer');
        if (navigationDrawer) {
            navigationDrawer.innerHTML = navigationItems;
        }
        
        this._initAppBar();
    },

    _initAppBar() {
        const hamburgerButton = document.querySelector('#hamburgerButton');
        const navigationDrawer = document.querySelector('#navigationDrawer');
        const content = document.querySelector('#mainContent');
        const logoutButton = document.querySelector('#logoutButton');
    
        if (hamburgerButton) {
            hamburgerButton.addEventListener('click', (event) => {
                navigationDrawer.classList.toggle('open');
            });
        }
    
        if (content) {
            content.addEventListener('click', (event) => {
                if (navigationDrawer) {
                    navigationDrawer.classList.remove('open');
                }
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', (event) => {
                event.preventDefault();
                Auth.removeToken();
                console.log('Logged out, token removed');
                window.location.hash = '#/login';
                window.location.reload(); 
            });
        }
    },
};
    
export default AppBar;