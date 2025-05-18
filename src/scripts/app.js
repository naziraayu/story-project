// src/scripts/app.js
import 'regenerator-runtime';
import '../styles/main.css';
import AppBar from './components/app-bar';
import Footer from './components/footer';
import UrlParser from './utils/url-parser';
import routes from './routes';
import Auth from './utils/auth';
import PushHelper from './utils/push-helper';

if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then((permission) => {
    console.log('Notification permission:', permission);
    if (permission !== 'granted') {
      alert('Notifikasi tidak diizinkan. Aktifkan untuk menerima push.');
    }
  });
}


class App {
    constructor() {
        this._content = document.querySelector('#mainContent');
        this._initiateAppShell();
    }

    _initiateAppShell() {
        AppBar.init();
        Footer.init();
    }

    async _checkAuthAndRedirect() {
        const url = UrlParser.parseActiveUrlWithoutCombiner();
        const isAuthPage = url.resource === 'login' || url.resource === 'register';
        
        if (!Auth.isLoggedIn() && !isAuthPage) {
            if (!url.resource) {
                window.location.hash = '#/register';
                return false;
            } else {
                window.location.hash = '#/login';
                return false;
            }
        }
        
        if (Auth.isLoggedIn() && isAuthPage) {
            window.location.hash = '#/';
            return false;
        }
        
        return true;
    }

    async renderPage() {
        try {
            const shouldRender = await this._checkAuthAndRedirect();
            if (!shouldRender) return;

            const url = UrlParser.parseActiveUrlWithCombiner();
            const page = routes[url];
            
            if (!page) {
                this._content.innerHTML = '<div class="error-message">Page not found</div>';
                return;
            }
            
            try {
                if (document.startViewTransition && typeof document.startViewTransition === 'function') {
                    await document.startViewTransition(async () => {
                        this._content.innerHTML = await page.view.render();
                        if (page.presenter) {
                            await page.view.afterRender(page.presenter);
                        } else {
                            await page.view.afterRender();
                        }
                    }).ready;
                } else {
                    this._content.innerHTML = await page.view.render();
                    if (page.presenter) {
                        await page.view.afterRender(page.presenter);
                    } else {
                        await page.view.afterRender();
                    }
                }
            } catch (transitionError) {
                console.error('View transition error:', transitionError);
                this._content.innerHTML = await page.view.render();
                if (page.presenter) {
                    await page.view.afterRender(page.presenter);
                } else {
                    await page.view.afterRender();
                }
            }
            
            AppBar.init();
            
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error rendering page:', error);
            this._content.innerHTML = `<div class="error-message">Failed to load page: ${error.message}</div>`;
        }
    }
}

const app = new App();

window.addEventListener('hashchange', () => {
    app.renderPage();
});

window.addEventListener('load', async () => {
    await app.renderPage();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            console.log('Service worker registered:', reg);
        } catch (err) {
            console.error('SW registration failed:', err);
        }
    }

    // Inisialisasi tombol subscribe
    await initPushSubscriptionButton();
});

async function initPushSubscriptionButton() {
    const subscribeButton = document.getElementById('subscribePush');
    if (!subscribeButton) {
        console.warn('Subscribe button not found in the DOM');
        return;
    }

    // Disable button sementara kita memeriksa status
    subscribeButton.disabled = true;
    
    try {
        // Periksa status langganan
        const subscription = await PushHelper.isUserSubscribed();
        
        // Update teks tombol berdasarkan status langganan
        subscribeButton.textContent = subscription ? 'Unsubscribe' : 'Subscribe';
        subscribeButton.disabled = false;
        
        // Tambahkan listener klik
        subscribeButton.addEventListener('click', async () => {
            const token = Auth.getToken();
            if (!token) {
                alert('Anda harus login untuk mengatur notifikasi.');
                return;
            }
            
            // Disable tombol selama proses
            subscribeButton.disabled = true;
            
            try {
                const isSubscribed = await PushHelper.isUserSubscribed();
                
                if (isSubscribed) {
                    // Proses unsubscribe
                    await PushHelper.unsubscribeUser(token);
                    console.log('User unsubscribed from push notifications');
                } else {
                    // Proses subscribe
                    await PushHelper.subscribeUser(token);
                    console.log('User subscribed to push notifications');
                }
                
                // Update teks tombol setelah aksi
                const refreshedStatus = await PushHelper.isUserSubscribed();
                subscribeButton.textContent = refreshedStatus ? 'Unsubscribe' : 'Subscribe';
            } catch (err) {
                console.error('Error toggling subscription:', err);
                alert(`Terjadi kesalahan: ${err.message}`);
            } finally {
                // Re-enable tombol
                subscribeButton.disabled = false;
            }
        });
    } catch (err) {
        console.error('Error initializing push button:', err);
        subscribeButton.disabled = false;
        subscribeButton.textContent = 'Subscribe';
    }
}

export default App;