<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Heart } from '@lucide/svelte';
	import {
		toggleLike,
		getLikeStats,
		subscribeToLikes,
		optimisticLikeUpdate,
		type LikeStats,
	} from '$lib/services/likesService';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		listingId: string;
		size?: 'sm' | 'md' | 'lg';
		showCount?: boolean;
		showRecentLikers?: boolean;
		realtime?: boolean;
	}

	let {
		listingId,
		size = 'md',
		showCount = true,
		showRecentLikers = false,
		realtime = true,
	}: Props = $props();

	let likeStats = $state<LikeStats>({
		totalLikes: 0,
		isLiked: false,
		recentLikers: [],
	});

	let isAnimating = $state(false);
	let isLoading = $state(false);
	let unsubscribe: (() => void) | null = null;
	
	// Get auth context
	let auth: ReturnType<typeof getAuthContext> | null = null;
	try {
		auth = getAuthContext();
	} catch {
		auth = null;
	}

	const iconSizes = {
		sm: 18,
		md: 24,
		lg: 28,
	};

	onMount(async () => {
		await loadLikeStats();

		if (realtime) {
			unsubscribe = subscribeToLikes(listingId, (stats) => {
				likeStats = stats;
			});
		}
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	async function loadLikeStats() {
		try {
			isLoading = true;
			likeStats = await getLikeStats(listingId);
		} catch (error) {
			console.error('Error loading like stats:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleLike() {
		if (!auth?.user) {
			goto('/auth/login');
			return;
		}

		if (isLoading) return;

		try {
			// Optimistic update for instant feedback
			const wasLiked = likeStats.isLiked;
			likeStats = optimisticLikeUpdate(likeStats, !wasLiked);

			// Trigger heart animation
			isAnimating = true;
			setTimeout(() => (isAnimating = false), 600);

			// Make API call
			const result = await toggleLike(listingId);

			// Update with server response (in case of discrepancy)
			likeStats = {
				...likeStats,
				isLiked: result.isLiked,
				totalLikes: result.totalLikes,
			};
		} catch (error) {
			console.error('Error toggling like:', error);
			// Revert optimistic update on error
			await loadLikeStats();
		}
	}

	function formatLikeCount(count: number): string {
		if (count === 0) return '';
		if (count === 1) return '1 like';
		if (count < 1000) return `${count} likes`;
		if (count < 1000000) return `${(count / 1000).toFixed(1)}k likes`;
		return `${(count / 1000000).toFixed(1)}M likes`;
	}

	function getRecentLikersText(): string {
		const { recentLikers, totalLikes } = likeStats;
		if (recentLikers.length === 0) return '';

		if (totalLikes === 1) {
			return `Liked by ${recentLikers[0].username}`;
		} else if (totalLikes === 2) {
			return `Liked by ${recentLikers[0].username} and ${recentLikers[1].username}`;
		} else if (totalLikes > 2) {
			const others = totalLikes - 1;
			return `Liked by ${recentLikers[0].username} and ${others} ${others === 1 ? 'other' : 'others'}`;
		}

		return '';
	}
</script>

<div class="like-container">
	<!-- Like Button -->
	<button
		class="like-button {size} {likeStats.isLiked ? 'liked' : ''} {isAnimating ? 'animating' : ''}"
		onclick={handleLike}
		disabled={isLoading}
		aria-label={likeStats.isLiked ? 'Unlike' : 'Like'}
	>
		<Heart
			size={iconSizes[size]}
			fill={likeStats.isLiked ? 'currentColor' : 'none'}
			class="heart-icon"
		/>

		<!-- Animated hearts for like animation -->
		{#if isAnimating && likeStats.isLiked}
			<div class="floating-hearts">
				{#each Array(6) as _, i}
					<Heart
						size={12 + i * 2}
						fill="currentColor"
						class="floating-heart"
						style="animation-delay: {i * 0.1}s"
					/>
				{/each}
			</div>
		{/if}
	</button>

	<!-- Like Count and Recent Likers -->
	{#if showCount && likeStats.totalLikes > 0}
		<div class="like-info">
			{#if showRecentLikers && likeStats.recentLikers.length > 0}
				<p class="recent-likers">
					{getRecentLikersText()}
				</p>
			{:else}
				<p class="like-count">
					{formatLikeCount(likeStats.totalLikes)}
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.like-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.like-button {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		color: var(--color-text-secondary);
	}

	.like-button:hover {
		background: var(--color-primitive-var(--color-primitive-black)) / 5;
		transform: scale(1.1);
	}

	.like-button:active {
		transform: scale(0.95);
	}

	.like-button.liked {
		color: var(--color-text-error); /* Instagram red */
	}

	.like-button.liked :global(.heart-icon) {
		animation: likePopIn 0.3s ease-out;
	}

	.like-button.animating {
		animation: likeBounce 0.6s ease-out;
	}

	.like-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Size variants */
	.like-button.sm {
		padding: 0.25rem;
	}

	.like-button.md {
		padding: 0.5rem;
	}

	.like-button.lg {
		padding: 0.75rem;
	}

	/* Floating hearts animation */
	.floating-hearts {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
	}

	.floating-hearts :global(.floating-heart) {
		position: absolute;
		color: var(--color-text-error);
		animation: floatUp 0.8s ease-out forwards;
		opacity: 0;
	}

	/* Like info */
	.like-info {
		font-size: 0.875rem;
		margin-left: 0.5rem;
	}

	.like-count {
		color: var(--color-text-primary);
		font-weight: 600;
		margin: 0;
	}

	.recent-likers {
		color: var(--color-text-primary);
		margin: 0;
	}

	/* Animations */
	@keyframes likePopIn {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes likeBounce {
		0% {
			transform: scale(1);
		}
		25% {
			transform: scale(1.2);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes floatUp {
		0% {
			opacity: 1;
			transform: translate(0, 0) scale(0.5);
		}
		50% {
			opacity: 0.8;
			transform: translate(calc(var(--random-x, 0) * 40px), -30px) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(calc(var(--random-x, 0) * 80px), -60px) scale(1.2);
		}
	}

	/* Distribute floating hearts randomly */
	.floating-hearts :global(.floating-heart:nth-child(1)) {
		--random-x: -1;
	}
	.floating-hearts :global(.floating-heart:nth-child(2)) {
		--random-x: -0.5;
	}
	.floating-hearts :global(.floating-heart:nth-child(3)) {
		--random-x: 0;
	}
	.floating-hearts :global(.floating-heart:nth-child(4)) {
		--random-x: 0.5;
	}
	.floating-hearts :global(.floating-heart:nth-child(5)) {
		--random-x: 1;
	}
	.floating-hearts :global(.floating-heart:nth-child(6)) {
		--random-x: -0.8;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.like-button {
			padding: 0.375rem;
		}

		.like-info {
			font-size: 0.8125rem;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.like-button,
		.floating-hearts :global(.floating-heart) {
			animation: none !important;
		}

		.like-button:hover {
			transform: none;
		}
	}
</style>
