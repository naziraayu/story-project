// src/scripts/utils/camera-helper.js
class CameraHelper {
    constructor() {
        this.mediaStream = null;
        this.videoElement = null;
        this.canvasElement = null;
    }
  
    // 异步初始化摄像头
    async initCamera(videoElement, canvasElement) {
        // 将传入的videoElement和canvasElement赋值给this.videoElement和this.canvasElement
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        
        try {
            const constraints = {
                video: true
            };
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.mediaStream;
            
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    resolve(true);
                };
            });
        } catch (error) {
            console.error('Error initializing camera:', error);
            throw error;
        }
    }
  
    captureImage() {
        if (!this.videoElement || !this.canvasElement) {
            throw new Error('Video or canvas element not initialized');
        }
    
        const context = this.canvasElement.getContext('2d');
        const { videoWidth, videoHeight } = this.videoElement;
        
        this.canvasElement.width = videoWidth || 640;
        this.canvasElement.height = videoHeight || 480;
        
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        return new Promise((resolve) => {
            this.canvasElement.toBlob((blob) => {
            resolve(blob);
            }, 'image/jpeg', 0.8);
        });
    }
  
    stopCamera() {
        if (this._mediaStream) {
            this._mediaStream.getTracks().forEach(track => track.stop());
            console.log('📷 Kamera berhasil dimatikan (dari CameraHelper).');
            this._mediaStream = null;
        } else {
            console.log('ℹ️ Tidak ada kamera aktif yang perlu dimatikan.');
        }
    }

}
  
export default CameraHelper;