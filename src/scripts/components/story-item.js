 // src/scripts/components/story-item.js
const StoryItem = (story) => `
    <article class="story-item">
        <div class="story-item__header">
            <img src="${story.photoUrl}" alt="${story.description}" class="story-item__thumbnail">
        </div>
        <div class="story-item__content">
            <h3 class="story-item__title">
            <a href="#/detail/${story.id}" aria-label="view detail of ${story.name}'s story">
                ${story.name}'s Story
            </a>
            </h3>
            <p class="story-item__date">
            <i class="fas fa-calendar"></i> ${new Date(story.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
            </p>
            <p class="story-item__description">${story.description}</p>
        </div>
    </article>
`;

export default StoryItem;