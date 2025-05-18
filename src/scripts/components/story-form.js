// src/scripts/components/story-form.js
const StoryForm = {
    init({ onSubmit }) {
        this._onSubmit = onSubmit;
        this._renderForm();
        this._initEventListeners();
    },
  
    _renderForm() {
        return `
            <form id="storyForm" class="story-form">
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
                <label for="latitude">Latitude</label>
                <input type="number" id="latitude" step="any" min="-90" max="90">
            </div>
            
            <div class="form-group">
                <label for="longitude">Longitude</label>
                <input type="number" id="longitude" step="any" min="-180" max="180">
            </div>
            
            <div class="form-group">
                <button type="submit" class="btn btn-primary" id="submitButton" disabled>
                <i class="fas fa-paper-plane"></i> Submit Story
                </button>
            </div>
            </form>
        `;
    },
  
    _initEventListeners() {
        const form = document.getElementById('storyForm');
        
        if (form) {
            form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const description = document.getElementById('description').value;
            const latitude = document.getElementById('latitude').value;
            const longitude = document.getElementById('longitude').value;
            
            this._onSubmit({
                description,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
            });
            });
        }
    },
  
    disableSubmitButton() {
        const submitButton = document.getElementById('submitButton');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        }
    },
  
    enableSubmitButton() {
        const submitButton = document.getElementById('submitButton');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Story';
        }
    },
  
    showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
    },
  
    hideError() {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
    },
};
  
export default StoryForm;