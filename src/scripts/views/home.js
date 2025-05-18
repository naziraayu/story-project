// src/scripts/views/home.js
import StoryItem from '../components/story-item';
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
        } catch (error) {
            storiesContainer.innerHTML = `<div class="error-message">${error.message}</div>`;
        }
    },
};

export default Home;