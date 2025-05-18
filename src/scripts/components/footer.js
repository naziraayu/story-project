// src/scripts/components/footer.js
const Footer = {
    init() {
        this._renderFooter();
    },
  
    _renderFooter() {
        const footerElement = document.querySelector('footer');
        footerElement.innerHTML = `
            <div class="footer-content">
            <p>Story App &copy; ${new Date().getFullYear()} - Developed by Nazira</p>
            </div>
        `;
    },
};
  
export default Footer;