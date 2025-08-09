<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		hasStory?: boolean;
		isViewed?: boolean;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		children: Snippet;
		class?: string;
	}
	
	let { 
		hasStory = false, 
		isViewed = false,
		size = 'md',
		children,
		class: className = ''
	}: Props = $props();
	
	const sizeClasses = {
		sm: 'w-12 h-12',
		md: 'w-16 h-16',
		lg: 'w-20 h-20',
		xl: 'w-24 h-24'
	};
	
	const paddingClasses = {
		sm: 'p-[2px]',
		md: 'p-[2.5px]',
		lg: 'p-[3px]',
		xl: 'p-[3.5px]'
	};
</script>

<div class="story-ring-container {sizeClasses[size]} {className}">
	{#if hasStory}
		<div class="story-ring {paddingClasses[size]} {isViewed ? 'viewed' : 'active'}">
			<div class="story-content">
				{@render children()}
			</div>
		</div>
	{:else}
		<div class="story-ring-empty {paddingClasses[size]}">
			<div class="story-content">
				{@render children()}
			</div>
		</div>
	{/if}
</div>

<style>
	.story-ring-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.story-ring {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	
	.story-ring.active {
		background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
		animation: pulse 2s ease infinite;
	}
	
	.story-ring.viewed {
		background: linear-gradient(45deg, var(--color-border-primary) 0%, var(--color-border-secondary) 100%);
	}
	
	.story-ring-empty {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: transparent;
		border: 1.5px solid var(--color-border-primary);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.story-content {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: white;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
	}
	
	.story-content :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}
	
	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}
	
	/* Hover effect */
	.story-ring-container:hover .story-ring.active {
		transform: scale(1.05);
		transition: transform 0.2s ease;
	}
</style>