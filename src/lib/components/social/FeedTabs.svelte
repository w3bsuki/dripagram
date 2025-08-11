<script lang="ts">
	import * as m from '$lib/paraglide/messages';
	
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
			{m['feed.for_you']()}
		</button>
		
		<div class="separator"></div>
		
		<button
			class="feed-tab {feedType === 'following' ? 'active' : ''}"
			onclick={() => onFeedChange('following')}
			disabled={isLoading}
		>
			{m['feed.following']()}
		</button>
		
		<div class="separator"></div>
		
		<button
			class="feed-tab {feedType === 'trending' ? 'active' : ''}"
			onclick={() => onFeedChange('trending')}
			disabled={isLoading}
		>
			{m['feed.trending']()}
		</button>
	</div>
</div>

<style>
	/* Instagram-style Feed Tabs */
	.feed-tabs {
		background: white;
		border-bottom: 1px solid #efefef;
	}

	.tabs-container {
		display: flex;
		align-items: center;
		margin: 0 auto;
		padding: 0;
		height: 50px;
	}

	.feed-tab {
		flex: 1;
		height: 100%;
		padding: 0 16px;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		font-size: 15px;
		font-weight: 600;
		color: #8e8e8e;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.feed-tab:hover:not(:disabled) {
		color: #262626;
	}

	.feed-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.feed-tab.active {
		color: #262626;
		border-bottom-color: #262626;
	}

	/* Remove the ::after pseudo element since we're using border-bottom */
	.feed-tab.active::after {
		display: none;
	}

	/* Hide separators - cleaner look */
	.separator {
		display: none;
	}

	@media (max-width: 640px) {
		.tabs-container {
			height: 48px;
		}
		
		.feed-tab {
			font-size: 14px;
			padding: 0 12px;
		}
	}

	@media (min-width: 768px) {
		.tabs-container {
			max-width: 600px;
		}
	}
</style>