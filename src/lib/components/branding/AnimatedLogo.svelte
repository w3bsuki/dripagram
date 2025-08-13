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
	
	// Animate through clothing emojis
	onMount(() => {
		const interval = setInterval(() => {
			currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
		}, 2000); // Change every 2 seconds
		
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
		<span 
			class="emoji active"
			aria-hidden="true"
		>
			{emojis[currentEmojiIndex]}
		</span>
	</div>
</div>

<style>
	.logo-container {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing);
		user-select: none;
		cursor: pointer;
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
		opacity: 1;
		filter: grayscale(0%);
		transition: all 0.3s ease-in-out;
		transform: scale(1);
		animation: bounce 0.6s ease-in-out;
	}
	
	@keyframes bounce {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}
	
</style>