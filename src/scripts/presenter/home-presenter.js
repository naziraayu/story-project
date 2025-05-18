// src/scripts/presenter/home-presenter.js
import StoryApi from '../data/story-api';

class HomePresenter {
    async getStories() {
        try {
            return await StoryApi.getAllStories();
        } catch (error) {
            throw error;
        }
    }
}

export default HomePresenter;



