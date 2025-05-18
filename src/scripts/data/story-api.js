// src/scripts/data/story-api.js
import API_ENDPOINT from './api-config';
import Auth from '../utils/auth';
import PushHelper from '../utils/push-helper';

class StoryApi {
    static async getAllStories() {
        try {
            const token = Auth.getToken();
            console.log('Getting stories with token:', token ? 'exists' : 'not found');
            
            if (!token) {
                throw new Error('Anda belum login');
            }
            
            const response = await fetch(`${API_ENDPOINT.BASE_URL}${API_ENDPOINT.GET_ALL_STORIES}`, {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            });
            
            const responseJson = await response.json();
            console.log('Get stories response:', responseJson);
            
            if (responseJson.error) {
                throw new Error(responseJson.message);
            }
            
            return responseJson.listStory;
        } catch (error) {
            console.error('Error getting all stories:', error);
            throw error;
        }
    }

    static async getStoryDetail(id) {
        try {
            const token = Auth.getToken();
            if (!token) throw new Error('Anda belum login');
            
            console.log('Using original ID for API request:', id);
            
            const url = `${API_ENDPOINT.BASE_URL}/stories/${id}`;
            console.log('Full request URL:', url);
            
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Story could not be found (Status: ${response.status})`);
            }
            
            const responseJson = await response.json();
            
            if (responseJson.error) {
                throw new Error(responseJson.message);
            }
            
            return responseJson.story;
        } catch (error) {
            console.error('Error getting story detail:', error);
            throw error;
        }
    }
    
    static async addStory(storyData) {
        try {
            const token = Auth.getToken();
            console.log('Adding story with token:', token ? 'exists' : 'not found');
            
            if (!token) {
                throw new Error('Anda belum login');
            }
            
            const formData = new FormData();
            formData.append('description', storyData.description);
            formData.append('photo', storyData.photo);
            
            if (storyData.lat !== null && storyData.lon !== null) {
                console.log('Adding location data:', storyData.lat, storyData.lon);
                formData.append('lat', storyData.lat);
                formData.append('lon', storyData.lon);
            }
        
            console.log('Sending story data:', {
                description: storyData.description,
                hasPhoto: !!storyData.photo,
                hasLocation: storyData.lat !== null && storyData.lon !== null,
                lat: storyData.lat,
                lon: storyData.lon
            });
        
            const response = await fetch(`${API_ENDPOINT.BASE_URL}${API_ENDPOINT.POST_STORY}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
        
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
        
            const responseJson = await response.json();
            console.log('Add story response:', responseJson);
            
            if (responseJson.error) {
                throw new Error(responseJson.message);
            }
            
            const isSubscribed = await PushHelper.isUserSubscribed();
            if (isSubscribed) {
                try {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification('Story berhasil ditambahkan!', {
                        body: 'Terima kasih telah berbagi cerita anda',
                        icon: '/icons/icon-192.png',
                        requireInteraction: false
                    });
                    console.log('🔔 Showing notification: user is subscribed.');
                } catch (notifError) {
                    console.error('Error showing notification:', notifError);
                }
            } else {
                console.log('🔕 Not showing notification: user not subscribed.');
            }
            
            return responseJson;

        } catch (error) {
            console.error('Error adding story:', error);
            throw error;
        }
    }
}

export default StoryApi;