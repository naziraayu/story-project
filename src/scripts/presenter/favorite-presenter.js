// presenter/favorite-presenter.js
import FavoriteDB from '../utils/favorite-db';

class FavoritePresenter {
  constructor({ viewContainer }) {
    this._viewContainer = viewContainer;
  }

  async init() {
    const favorites = await FavoriteDB.getAll();
    const container = document.querySelector('#favorite-list');

    if (!container) return;

    if (favorites.length === 0) {
      container.innerHTML = '<p>Belum ada cerita favorit.</p>';
    } else {
      container.innerHTML = favorites.map((story) => `
        <div class="story-item">
          <h3>${story.name}'s Story</h3>
          <img src="${story.photoUrl}" alt="${story.name}" class="story-img" style="max-width: 100%; height: auto;" />
          <p>${story.description}</p>
          <button class="remove-favorite" data-id="${story.id}">🗑️ Hapus</button>
        </div>
      `).join('');

      document.querySelectorAll('.remove-favorite').forEach((btn) => {
        btn.addEventListener('click', async () => {
          await FavoriteDB.delete(btn.dataset.id);
          await this.init();
        });
      });
    }
  }
}

export default FavoritePresenter;