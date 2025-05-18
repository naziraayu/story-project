// views/favorite.js
const Favorite = {
  async render() {
    return `
      <h2>🌟 Cerita Favorit</h2>
      <div id="favorite-list"></div>
    `;
  },

  async afterRender(presenter) {
    await presenter.init();
  },
};

export default Favorite;