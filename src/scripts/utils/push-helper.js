// src/scripts/utils/push-helper.js

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
import API_ENDPOINT from '../data/api-config';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const PushHelper = {
  _subscriptionStatus: null,

    async subscribeUser(token) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.error('Push notifications not supported in this browser');
        throw new Error('Push notifications not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription;
      
      try {
        // Cek apakah sudah ada subscription
        subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          console.log('Already subscribed with endpoint:', subscription.endpoint);
          this._subscriptionStatus = subscription;
          return subscription;
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }

      // Buat subscription baru
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('New subscription created:', subscription);

      // Kirim ke server
      const response = await fetch(`${API_ENDPOINT.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server rejected subscription:', errorData);
        throw new Error(errorData.message || 'Failed to register push subscription on server');
      }

      // Simpan status langganan
      this._subscriptionStatus = subscription;
      
      // Tampilkan notifikasi konfirmasi langganan
      await registration.showNotification('Berhasil berlangganan notifikasi!', {
        body: 'Anda akan menerima pemberitahuan saat ada story baru',
        icon: '/icons/icon-192.png',
      });
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  },

    async unsubscribeUser(token) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.warn('⚠️ Tidak ada subscription untuk di-unsubscribe.');
        this._subscriptionStatus = null;
        return;
      }

      const endpoint = subscription.endpoint;
      console.log('🔕 Unsubscribing endpoint:', endpoint);

      // Kirim ke server dulu
      try {
        const response = await fetch(`${API_ENDPOINT.BASE_URL}/notifications/unsubscribe`, {
          method: 'POST', // Sesuaikan dengan API endpoint yang benar
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Server failed to unsubscribe:', errorData);
          // Lanjutkan proses meskipun server error
        }
      } catch (serverError) {
        console.error('Failed to contact server for unsubscribe:', serverError);
        // Tetap lanjutkan proses meskipun server error
      }

      // Hapus subscription dari browser
      const unsubResult = await subscription.unsubscribe();
      if (!unsubResult) {
        console.warn('⚠️ Browser unsub returned false. Might not be successful.');
      }

      console.log('Successfully unsubscribed from push notifications');
      
      // Reset status langganan
      this._subscriptionStatus = null;
      
      // Notifikasi sukses manual
      await registration.showNotification('Berhasil berhenti berlangganan notifikasi.', {
        body: 'Anda tidak akan menerima pemberitahuan lagi',
        icon: '/icons/icon-192.png',
      });
    } catch (error) {
      console.error('Gagal unsubscribe:', error);
      throw error;
    }
  },


  async isUserSubscribed() {
    // Gunakan cached status jika tersedia
    if (this._subscriptionStatus !== null) {
      return this._subscriptionStatus;
    }
    
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return null;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      // Cache status langganan
      this._subscriptionStatus = subscription;
      
      return subscription;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return null;
    }
  }
};

export default PushHelper;
