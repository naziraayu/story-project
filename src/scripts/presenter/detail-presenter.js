// src/scripts/presenter/detail-presenter.js
import StoryApi from '../data/story-api';

class DetailPresenter {
    async getStoryDetail(id) {
        try {
            console.log(`Fetching story with ID: ${id}`);
            return await StoryApi.getStoryDetail(id);
        } catch (error) {
            console.error('DetailPresenter Error:', error);
            throw error;
        }
    }
}

export default DetailPresenter;