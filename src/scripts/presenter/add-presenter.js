// src/scripts/presenter/add-presenter.js
import StoryApi from '../data/story-api';

class AddPresenter {
    async addStory(storyData) {
        try {
            console.log('AddPresenter: Preparing to add story', {
                hasDescription: !!storyData.description,
                hasPhoto: !!storyData.photo,
                hasLocation: !!(storyData.lat && storyData.lon)
            });
            return await StoryApi.addStory(storyData);
        } catch (error) {
            console.error('AddPresenter: Error adding story', error);
            throw error;
        }
    }
}

export default AddPresenter;