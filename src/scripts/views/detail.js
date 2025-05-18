// src/scripts/views/detail.js
import L from 'leaflet';
import CONSTANTS from '../utils/constants';
import UrlParser from '../utils/url-parser';

const Detail = {
    async render() {
        return `
        <section class="content">
            <div id="story" class="detail-story">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading story...</p>
            </div>
            </div>
            <div id="storyMap" class="detail-story__map"></div>
        </section>
        `;
    },

    async afterRender(presenter) {
        const storyContainer = document.querySelector('#story');
        const mapContainer = document.querySelector('#storyMap');
        
        try {
            const url = UrlParser.parseActiveUrlWithoutCombiner();
            console.log('Parsed URL in detail view:', url);
            
            let storyId = url.id;
            console.log('Original story ID from URL:', storyId);
            
            if (!storyId) {
                throw new Error('No story ID provided');
            }

            const story = await presenter.getStoryDetail(storyId);
            console.log('Story detail data:', story);
            console.log('Location data present:', story.lat && story.lon ? 'Yes' : 'No');
                
            storyContainer.innerHTML = `
                <img src="${story.photoUrl}" alt="${story.description}" class="detail-story__image">
                <div class="detail-story__content">
                <h2 class="detail-story__title">${story.name}</h2>
                <p class="detail-story__info">
                    <i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                    })}
                </p>
                <p class="detail-story__description">${story.description}</p>
                </div>
            `;
        
            if (story.lat && story.lon) {
                const map = L.map(mapContainer).setView([story.lat, story.lon], CONSTANTS.DEFAULT_ZOOM);
                
                const standardLayer = L.tileLayer(CONSTANTS.MAP_TILE_URL, {
                    attribution: CONSTANTS.MAP_TILE_ATTRIBUTION,
                });
                
                const satelliteLayer = L.tileLayer(CONSTANTS.MAP_SATELLITE_URL, {
                    attribution: CONSTANTS.MAP_SATELLITE_ATTRIBUTION,
                });
                
                const baseLayers = {
                    'Standard': standardLayer,
                    'Satellite': satelliteLayer,
                };
                
                L.control.layers(baseLayers).addTo(map);
                
                standardLayer.addTo(map);
                
                const marker = L.marker([story.lat, story.lon]).addTo(map);
                
                marker.bindPopup(`
                <h3>${story.name}</h3>
                <img src="${story.photoUrl}" alt="${story.description}" style="width: 100px; height: auto;">
                <p>${story.description.substring(0, 50)}${story.description.length > 50 ? '...' : ''}</p>
                `).openPopup();
            } else {
                mapContainer.innerHTML = '<div class="error-message">No location data available for this story</div>';
            }
        } catch (error) {
            console.error('Detail View Error:', error);
            storyContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${this._getUserFriendlyError(error)}</p>
                    <button id="retryButton" class="btn">Try Again</button>
                </div>
            `;
            
            document.getElementById('retryButton').addEventListener('click', () => {
                this.afterRender(presenter);
            });
        }
    },
    _getUserFriendlyError(error) {
        if (error.message.includes('not found') || error.message.includes('could not be found')) {
            return 'Story not found. It may have been deleted.';
        }
        if (error.message.includes('login') || error.message.includes('Unauthorized')) {
            return 'Please login to view this story.';
        }
        return 'Failed to load story. Please try again.';
    }
};

export default Detail;