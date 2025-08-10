<script lang="ts">
	type FeedType = 'for-you' | 'following' | 'trending';

	let { 
		feedType,
		isLoading,
		onFeedChange
	}: {
		feedType: FeedType;
		isLoading: boolean;
		onFeedChange: (type: FeedType) => void;
	} = $props();
</script>

<!-- Instagram-style Feed Tabs -->
<div class="feed-tabs">
	<div class="tabs-container">
		<button
			class="feed-tab {feedType === 'for-you' ? 'active' : ''}"
			onclick={() => onFeedChange('for-you')}
			disabled={isLoading}
		>
			For you
		</button>
		
		<div class="separator"></div>
		
		<button
			class="feed-tab {feedType === 'following' ? 'active' : ''}"
			onclick={() => onFeedChange('following')}
			disabled={isLoading}
		>
			Following
		</button>
		
		<div class="separator"></div>
		
		<button
			class="feed-tab {feedType === 'trending' ? 'active' : ''}"
			onclick={() => onFeedChange('trending')}
			disabled={isLoading}
		>
			Trending
		</button>
	</div>
</div>

<style>
	/* Clean Feed Tabs */
	.feed-tabs {
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.tabs-container {
		display: flex;
		align-items: center;
		max-width: 468px;
		margin: 0 auto;
		padding: 0;
		height: 48px; /* Fixed height to prevent shifts */
	}

	.feed-tab {
		flex: 1;
		height: 100%;
		padding: 0 1rem;
		background: none;
		border: none;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.feed-tab:hover {
		color: #374151;
	}

	.feed-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feed-tab.active {
		color: #111827;
		font-weight: 600;
	}

	.feed-tab.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 15%;
		right: 15%;
		height: 3px;
		background: #2563eb;
		border-radius: 3px 3px 0 0;
	}

	/* Vertical Separator */
	.separator {
		width: 1px;
		height: 20px;
		background: #e5e7eb;
	}

	@media (max-width: 640px) {
		.tabs-container {
			height: 48px; /* Keep consistent height */
		}
		
		.feed-tab {
			font-size: 0.875rem;
			padding: 0 0.75rem;
		}
	}
</style>