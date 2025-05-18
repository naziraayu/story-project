// src/scripts/views/add.js
import L from 'leaflet';
import CONSTANTS from '../utils/constants';
import CameraHelper from '../utils/camera-helper';
import StoryForm from '../components/story-form';

const Add = {
    async render() {
        return `
        <section class="content">
            <h2 class="content__heading">Add New Story</h2>
            <div id="errorContainer" class="error-message" style="display: none;"></div>
            <div id="form-container">
            <div class="story-form">
                <h2 class="story-form__title">Add New Story</h2>
                
                <div id="formErrorContainer" class="error-message" style="display: none;"></div>
                
                <form id="storyForm">
                <div class="form-group">
                    <label for="cameraPreview">Photo</label>
                    <div class="camera-preview">
                    <video id="cameraPreview" autoplay playsinline></video>
                    <canvas id="cameraCanvas" style="display: none;"></canvas>
                    <button id="captureButton" type="button" aria-label="capture photo">
                        <i class="fas fa-camera"></i>
                    </button>
                    </div>
                    <img id="previewImage" class="preview-image" style="display: none;" alt="Preview">
                </div>
                
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" required aria-required="true"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="map">Location</label>
                    <div id="map" style="height: 300px; margin-bottom: 10px;"></div>
                    <p><small>Click on the map to select a location</small></p>
                    <input type="hidden" id="latitude" name="latitude">
                    <input type="hidden" id="longitude" name="longitude">
                </div>
                
                <div class="form-group">
                    <button type="submit" class="btn btn-primary" id="submitButton" disabled>
                    <i class="fas fa-paper-plane"></i> Submit Story
                    </button>
                </div>
                </form>
            </div>
            </div>
        </section>
        `;
    },

    async afterRender(presenter) {
        try {
            const cameraHelper = new CameraHelper();
            const videoElement = document.getElementById('cameraPreview');
            const canvasElement = document.getElementById('cameraCanvas');
            const captureButton = document.getElementById('captureButton');
            const previewImage = document.getElementById('previewImage');
            const submitButton = document.getElementById('submitButton');
            const storyForm = document.getElementById('storyForm');
            const errorContainer = document.getElementById('errorContainer');
            const formErrorContainer = document.getElementById('formErrorContainer');
            const latitudeInput = document.getElementById('latitude');
            const longitudeInput = document.getElementById('longitude');
            const mapContainer = document.getElementById('map');
            
            let photoBlob = null;
            let marker = null;

            if (!mapContainer) {
                throw new Error('Map container not found');
            }

            try {
                await cameraHelper.initCamera(videoElement, canvasElement);
                captureButton.textContent = 'Capture';
            } catch (error) {
                console.error('Camera init error:', error);
                
                document.querySelector('.camera-preview').style.display = 'none';
                
                const cameraGroup = document.querySelector('.form-group:first-child');
                cameraGroup.innerHTML += `
                <div class="file-upload">
                    <label for="photoFile">Upload Foto</label>
                    <input type="file" id="photoFile" accept="image/*" aria-label="upload foto">
                </div>
                `;
                
                document.getElementById('photoFile').addEventListener('change', (event) => {
                    if (event.target.files && event.target.files[0]) {
                        photoBlob = event.target.files[0];
                        
                        previewImage.src = URL.createObjectURL(photoBlob);
                        previewImage.style.display = 'block';
                        
                        checkFormValidity();
                    }
                });
            }

            try {
                const defaultPosition = [CONSTANTS.DEFAULT_LAT, CONSTANTS.DEFAULT_LON];
                console.log('Initializing map with default position:', defaultPosition);
                
                const map = L.map(mapContainer).setView(defaultPosition, CONSTANTS.DEFAULT_ZOOM);
                
                const standardLayer = L.tileLayer(CONSTANTS.MAP_TILE_URL, {
                    attribution: CONSTANTS.MAP_TILE_ATTRIBUTION,
                });
                
                standardLayer.addTo(map);
                
                map.on('click', (event) => {
                    const { lat, lng } = event.latlng;
                    
                    console.log('Map clicked at position:', { lat, lng });
                    
                    latitudeInput.value = lat;
                    longitudeInput.value = lng;
                    
                    if (marker) {
                        map.removeLayer(marker);
                    }
                    
                    marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup('Selected location').openPopup();
                    
                    checkFormValidity();
                });
                
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } catch (mapError) {
                console.error('Map initialization error:', mapError);
                document.querySelector('.form-group:nth-child(3)').innerHTML = `
                    <p class="error-message">Failed to load map: ${mapError.message}</p>
                    <div class="form-group">
                        <label for="latitude">Latitude</label>
                        <input type="number" id="latitude" step="any" min="-90" max="90">
                    </div>
                    <div class="form-group">
                        <label for="longitude">Longitude</label>
                        <input type="number" id="longitude" step="any" min="-180" max="180">
                    </div>
                `;
            }

            if (captureButton) {
                captureButton.addEventListener('click', async () => {
                    try {
                        photoBlob = await cameraHelper.captureImage();
                        
                        const imageUrl = URL.createObjectURL(photoBlob);
                        previewImage.src = imageUrl;
                        previewImage.style.display = 'block';
                        videoElement.style.display = 'none';
                        captureButton.textContent = 'Retake';
                        
                        checkFormValidity();
                    } catch (error) {
                        console.error('Capture error:', error);
                        formErrorContainer.textContent = 'Failed to capture image: ' + error.message;
                        formErrorContainer.style.display = 'block';
                    }
                });
            }

            storyForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const description = document.getElementById('description').value;
                const latitude = latitudeInput ? latitudeInput.value : null;
                const longitude = longitudeInput ? longitudeInput.value : null;
                
                console.log('Form submission:', {
                    hasDescription: !!description,
                    hasPhoto: !!photoBlob,
                    photoType: photoBlob ? photoBlob.type : 'none',
                    photoSize: photoBlob ? photoBlob.size : 0,
                    lat: latitude ? parseFloat(latitude) : null,
                    lon: longitude ? parseFloat(longitude) : null,
                });
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                formErrorContainer.style.display = 'none';
                
                try {
                    if (!presenter || typeof presenter.addStory !== 'function') {
                        throw new Error('Presenter not available');
                    }
                    
                    const result = await presenter.addStory({
                        description,
                        photo: photoBlob,
                        lat: latitude ? parseFloat(latitude) : null,
                        lon: longitude ? parseFloat(longitude) : null,
                    });
                    
                    alert('Story added successfully!');
                    window.location.hash = '#/';
                } catch (error) {
                    console.error('Submit error:', error);
                    formErrorContainer.textContent = 'Failed to add story: ' + error.message;
                    formErrorContainer.style.display = 'block';
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Story';
                }
            });

            window.addEventListener('hashchange', () => {
                if (cameraHelper && typeof cameraHelper.stopCamera === 'function') {
                    cameraHelper.stopCamera();
                }
            });

            function checkFormValidity() {
                const descriptionValue = document.getElementById('description').value;
                submitButton.disabled = !(photoBlob && descriptionValue);
            }

            document.getElementById('description').addEventListener('input', checkFormValidity);
        } catch (error) {
            console.error('Critical initialization error:', error);
            const errorContainer = document.getElementById('errorContainer');
            errorContainer.textContent = `Failed to initialize add story page: ${error.message}`;
            errorContainer.style.display = 'block';
        }
    },
    stop() {
        if (cameraHelper) {
            cameraHelper.stopCamera();
            console.log('📷 Kamera berhasil dimatikan dari halaman Add.');
            cameraHelper = null;
        }
    },

};

let cameraHelper = null; // ← TAMBAHKAN INI di luar Add


export default Add;