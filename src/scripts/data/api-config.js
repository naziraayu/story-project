// src/scripts/data/api-config.js
const API_ENDPOINT = {
    BASE_URL: 'https://story-api.dicoding.dev/v1',
    GET_ALL_STORIES: '/stories',
    GET_STORY_DETAIL: (id) => `/stories/${id}`,
    POST_STORY: '/stories',
};
  
export default API_ENDPOINT;