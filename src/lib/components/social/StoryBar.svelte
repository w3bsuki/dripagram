<script context="module">
	function formatTimeLeft(endTime: Date): string {
		const now = new Date();
		const diff = endTime.getTime() - now.getTime();
		const hours = Math.floor(diff / 3600000);
		const minutes = Math.floor((diff % 3600000) / 60000);

		if (hours > 0) {
			return `${hours}h ${minutes}m`;
		}
		return `${minutes}m`;
	}
</script>

<script lang="ts">
	import { Plus, Zap } from '@lucide/svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';

	interface Story {
		id: string;
		type: 'collection' | 'flash-sale' | 'live' | 'new-drop';
		title: string;
		image: string;
		user?: {
			username: string;
			avatar: string;
		};
		isViewed?: boolean;
		isLive?: boolean;
		endTime?: Date;
	}

	let stories = $state<Story[]>([
		{
			id: '1',
			type: 'flash-sale',
			title: 'Flash Sale',
			image: '/story-covers/flash-sale.jpg',
			endTime: new Date(Date.now() + 3600000),
			isLive: true,
		},
		{
			id: '2',
			type: 'collection',
			title: 'Summer Vibes',
			image: '/story-covers/summer.jpg',
			user: {
				username: 'fashion_guru',
				avatar: '/avatars/user1.jpg',
			},
		},
		{
			id: '3',
			type: 'live',
			title: 'Live Now',
			image: '/story-covers/live.jpg',
			user: {
				username: 'vintage_shop',
				avatar: '/avatars/user2.jpg',
			},
			isLive: true,
		},
		{
			id: '4',
			type: 'new-drop',
			title: 'New Drop',
			image: '/story-covers/new-drop.jpg',
			user: {
				username: 'streetwear_bg',
				avatar: '/avatars/user3.jpg',
			},
		},
	]);

	let activeStory = $state<Story | null>(null);
	let storyProgress = $state(0);
	let progressInterval: ReturnType<typeof setInterval> | undefined;
	
	// Get auth context
	let auth: ReturnType<typeof getAuthContext> | null = null;
	try {
		auth = getAuthContext();
	} catch {
		auth = null;
	}

	function openStory(story: Story) {
		activeStory = story;
		story.isViewed = true;
		startProgress();
	}

	function closeStory() {
		activeStory = null;
		storyProgress = 0;
		if (progressInterval) {
			clearInterval(progressInterval);
		}
	}

	function startProgress() {
		storyProgress = 0;
		progressInterval = setInterval(() => {
			storyProgress += 2;
			if (storyProgress >= 100) {
				closeStory();
			}
		}, 100);
	}

	function createStory() {
		// Navigate to create story page
		window.location.href = '/create/story';
	}
</script>

<div class="story-bar">
	<div class="story-container">
		<!-- Create Story -->
		{#if auth?.user}
			<button class="story-item create-story" onclick={createStory}>
				<div class="story-avatar">
					<img src={(auth.user as any)?.avatar_url || '/default-avatar.png'} alt="Your story" />
					<span class="add-icon">
						<Plus size={16} />
					</span>
				</div>
				<span class="story-label">Your Story</span>
			</button>
		{/if}

		<!-- Stories -->
		{#each stories as story (story.id)}
			<button class="story-item {story.isViewed ? 'viewed' : ''}" onclick={() => openStory(story)}>
				<div class="story-avatar {story.isLive ? 'live' : ''}">
					<img src={story.image} alt={story.title} />
					{#if story.type === 'flash-sale'}
						<span class="story-badge flash">
							<Zap size={12} />
						</span>
					{:else if story.type === 'live'}
						<span class="story-badge live">LIVE</span>
					{/if}
				</div>
				<span class="story-label">{story.title}</span>
			</button>
		{/each}
	</div>
</div>

<!-- Story Viewer Modal -->
{#if activeStory}
	<div class="story-viewer" onclick={closeStory}>
		<div class="story-content" onclick={(e) => e.stopPropagation()}>
			<!-- Progress Bar -->
			<div class="progress-bar">
				<div class="progress-fill" style="width: {storyProgress}%"></div>
			</div>

			<!-- Story Header -->
			<div class="story-header">
				{#if activeStory.user}
					<div class="story-user">
						<img src={activeStory.user.avatar} alt={activeStory.user.username} />
						<span>{activeStory.user.username}</span>
					</div>
				{:else}
					<div class="story-title">{activeStory.title}</div>
				{/if}
				<button class="close-btn" onclick={closeStory}>×</button>
			</div>

			<!-- Story Image/Content -->
			<div class="story-media">
				<img src={activeStory.image} alt={activeStory.title} />

				{#if activeStory.type === 'flash-sale' && activeStory.endTime}
					<div class="flash-sale-timer">
						<Zap />
						<span>Ends in {formatTimeLeft(activeStory.endTime)}</span>
					</div>
				{/if}
			</div>

			<!-- Story Actions -->
			<div class="story-actions">
				{#if activeStory.type === 'collection'}
					<button class="action-button">View Collection</button>
				{:else if activeStory.type === 'flash-sale'}
					<button class="action-button accent">Shop Sale</button>
				{:else if activeStory.type === 'live'}
					<button class="action-button live">Join Live</button>
				{:else}
					<button class="action-button">Explore</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.story-bar {
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		padding: 1rem 0;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.story-bar::-webkit-scrollbar {
		display: none;
	}

	.story-container {
		display: flex;
		gap: 1rem;
		padding: 0 1rem;
	}

	.story-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
	}

	.story-avatar {
		width: 70px;
		height: 70px;
		border-radius: 50%;
		padding: 3px;
		background: linear-gradient(45deg, var(--color-primary), var(--color-accent));
		position: relative;
	}

	.story-avatar.live {
		background: linear-gradient(45deg, var(--color-live), #ff6b6b);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.story-item.viewed .story-avatar {
		background: var(--color-border);
	}

	.story-avatar img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--color-background);
	}

	.create-story .add-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		background: var(--color-primary);
		color: white;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-background);
	}

	.story-badge {
		position: absolute;
		bottom: -4px;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-background);
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 600;
		border: 2px solid var(--color-background);
		white-space: nowrap;
	}

	.story-badge.flash {
		background: var(--color-warning);
		color: white;
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.story-badge.live {
		background: var(--color-live);
		color: white;
	}

	.story-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		max-width: 70px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Story Viewer */
	.story-viewer {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fadeIn 0.3s ease-out;
	}

	.story-content {
		width: 100%;
		max-width: 400px;
		height: 90vh;
		max-height: 700px;
		background: var(--color-background);
		border-radius: 16px;
		overflow: hidden;
		position: relative;
	}

	.progress-bar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: rgba(255, 255, 255, 0.3);
		z-index: 10;
	}

	.progress-fill {
		height: 100%;
		background: white;
		transition: width 0.1s linear;
	}

	.story-header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7), transparent);
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 10;
	}

	.story-user {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: white;
	}

	.story-user img {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}

	.story-title {
		color: white;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		color: white;
		font-size: 2rem;
		cursor: pointer;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.story-media {
		width: 100%;
		height: 100%;
		position: relative;
	}

	.story-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			backdrop-filter: blur(0);
		}
		to {
			opacity: 1;
			backdrop-filter: blur(10px);
		}
	}

	.flash-sale-timer {
		position: absolute;
		bottom: 100px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		backdrop-filter: blur(10px);
	}

	.story-actions {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
	}

	.action-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 999px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		background: white;
		color: var(--color-text-primary);
	}

	.action-button.accent {
		background: var(--color-accent);
	}

	.action-button.live {
		background: var(--color-live);
		color: white;
	}

	.action-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		.story-content {
			width: 100%;
			height: 100%;
			max-height: none;
			border-radius: 0;
		}
	}
</style>
