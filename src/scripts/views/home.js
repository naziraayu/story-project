// src/scripts/views/home.js
import StoryItem from '../components/story-item';
import FavoriteDB from '../utils/favorite-db';
import PushHelper from '../utils/push-helper';


const Home = {
    async render() {
        return `
        <section class="content">
            <div id="stories" class="stories">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading stories...</p>
                </div>
            </div>
        </section>
        `;
    },

    async afterRender(presenter) {

        const storiesContainer = document.querySelector('#stories');
        
        try {
        const stories = await presenter.getStories();
        
        storiesContainer.innerHTML = '';
        
        if (stories.length === 0) {
            storiesContainer.innerHTML = '<div class="error-message">No stories found</div>';
            return;
        }
        
        stories.forEach((story) => {
            console.log('Story ID format in list:', story.id);
            storiesContainer.innerHTML += StoryItem(story);
        });

         // Tambahkan event listener untuk tombol favorit
        document.querySelectorAll('.favorite-button').forEach((button) => {
            button.addEventListener('click', async () => {
            const story = {
                id: button.dataset.id,
                name: button.dataset.name,
                description: button.dataset.description,
                photoUrl: button.dataset.photo,
                createdAt: button.dataset.created,
            };

            try {
                const existing = await FavoriteDB.get(story.id);
                if (existing) {
                alert('Cerita sudah ada di favorit.');
                return;
                }

                await FavoriteDB.put(story);
                alert('Berhasil ditambahkan ke favorit!');
            } catch (err) {
                console.error('Gagal menambahkan favorit:', err);
                alert('Gagal menambahkan ke favorit.');
            }
            });
        });
        } catch (error) {
            storiesContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    },
};

export default Home;