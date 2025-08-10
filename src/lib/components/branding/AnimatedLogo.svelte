<script lang="ts">
	import { onMount } from 'svelte';
	
	interface Props {
		size?: 'small' | 'medium' | 'large';
		showText?: boolean;
		class?: string;
	}
	
	let { 
		size = 'medium',
		showText = true,
		class: className = ''
	}: Props = $props();
	
	// Fashion and money emojis only
	const emojis = ['👕', '👗', '👔', '👖', '🧥', '👟', '💵', '💰'];
	let currentEmojiIndex = $state(0);
	
	// Smoother animation with CSS transitions
	onMount(() => {
		const interval = setInterval(() => {
			currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
		}, 3000);
		
		return () => clearInterval(interval);
	});
	
	const sizeMap = {
		small: { text: '1.125rem', emoji: '1rem', spacing: '0.375rem' },
		medium: { text: '1.5rem', emoji: '1.25rem', spacing: '0.5rem' },
		large: { text: '2rem', emoji: '1.5rem', spacing: '0.625rem' }
	};
</script>

<div class="logo-container {className}" style="--text-size: {sizeMap[size].text}; --emoji-size: {sizeMap[size].emoji}; --spacing: {sizeMap[size].spacing}">
	{#if showText}
		<span class="logo-text">
			driplo
		</span>
	{/if}
	<div class="emoji-container">
		{#each emojis as emoji, index}
			<span 
				class="emoji"
				class:active={index === currentEmojiIndex}
				aria-hidden="true"
			>
				{emoji}
			</span>
		{/each}
	</div>
</div>

<style>
	.logo-container {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing);
		user-select: none;
		cursor: pointer;
		transition: transform 0.2s ease;
	}
	
	.logo-container:hover {
		transform: scale(1.02);
	}
	
	.logo-container:active {
		transform: scale(0.98);
	}
	
	.logo-text {
		font-size: var(--text-size);
		font-weight: 800;
		letter-spacing: -0.03em;
		background: linear-gradient(135deg, #000 0%, #333 100%);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
	}
	
	.emoji-container {
		position: relative;
		width: var(--emoji-size);
		height: var(--emoji-size);
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}
	
	.emoji {
		position: absolute;
		font-size: var(--emoji-size);
		line-height: 1;
		opacity: 0;
		transform: scale(0) rotate(-180deg);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		filter: grayscale(0%);
	}
	
	.emoji.active {
		opacity: 1;
		transform: scale(1) rotate(0deg);
		animation: float 3s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% {
			transform: translateY(0) scale(1) rotate(0deg);
		}
		25% {
			transform: translateY(-2px) scale(1.05) rotate(5deg);
		}
		75% {
			transform: translateY(1px) scale(0.98) rotate(-5deg);
		}
	}
	
	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.emoji {
			transition: opacity 0.3s ease;
			transform: none;
		}
		
		.emoji.active {
			animation: none;
		}
		
		.logo-container:hover {
			transform: none;
		}
	}
</style>