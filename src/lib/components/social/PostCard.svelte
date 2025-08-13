<!--
PostCard - Instagram-style post component
Modular post card following Instagram design patterns with:
- Header (avatar, username, timestamp)
- Media carousel (images/video)
- Action bar (like, comment, share, save)
- Caption with mentions and hashtags
- Comments preview
-->
<script lang="ts">
	import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from '@lucide/svelte';
	import Button from '$lib/components/native/Button.svelte';
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import type { FeedProduct } from '$lib/types';

	interface Props {
		post: FeedProduct;
		showHeader?: boolean;
		showActions?: boolean;
		showCaption?: boolean;
		showComments?: boolean;
		compact?: boolean;
		onLike?: (postId: string) => void;
		onSave?: (postId: string) => void;
		onShare?: (postId: string) => void;
		onComment?: (postId: string) => void;
	}

	let {
		post,
		showHeader = true,
		showActions = true,
		showCaption = true,
		showComments = false,
		compact = false,
		onLike,
		onSave,
		onShare,
		onComment
	}: Props = $props();

	let isLiked = $state(post.isLiked);
	let isSaved = $state(false);
	let currentImageIndex = $state(0);
	let showFullCaption = $state(false);
	let showHeartBurst = $state(false);
	let doubleTapTimeout: ReturnType<typeof setTimeout> | null = null;

	// Handle like toggle
	function handleLike() {
		isLiked = !isLiked;
		onLike?.(post.id);
	}

	// Handle double tap to like with animation
	function handleDoubleTap(event: Event) {
		event.preventDefault();
		
		// Always like on double tap (even if already liked)
		if (!isLiked) {
			isLiked = true;
			onLike?.(post.id);
		}

		// Show heart burst animation
		showHeartBurst = true;
		
		// Hide heart burst after animation
		setTimeout(() => {
			showHeartBurst = false;
		}, 1000);
	}

	// Handle single tap with double-tap detection
	function handleImageTap(event: Event) {
		if (doubleTapTimeout) {
			// This is a double tap
			clearTimeout(doubleTapTimeout);
			doubleTapTimeout = null;
			handleDoubleTap(event);
		} else {
			// This is potentially the first tap of a double tap
			doubleTapTimeout = setTimeout(() => {
				doubleTapTimeout = null;
				// This was a single tap, no action needed for image tap
			}, 300);
		}
	}

	// Handle save toggle
	function handleSave() {
		isSaved = !isSaved;
		onSave?.(post.id);
	}

	// Handle share
	function handleShare() {
		onShare?.(post.id);
	}

	// Handle comment
	function handleComment() {
		onComment?.(post.id);
	}

	// Navigate images
	function nextImage() {
		if (post.images && currentImageIndex < post.images.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	// Format time ago
	function timeAgo(date: string): string {
		const now = new Date();
		const past = new Date(date);
		const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

		if (diffInSeconds < 60) return `${diffInSeconds}s`;
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
		return `${Math.floor(diffInSeconds / 86400)}d`;
	}

	// Truncate caption
	const MAX_CAPTION_LENGTH = 100;
	let displayCaption = $derived.by(() => {
		if (!post.description) return '';
		if (showFullCaption || post.description.length <= MAX_CAPTION_LENGTH) {
			return post.description;
		}
		return post.description.slice(0, MAX_CAPTION_LENGTH) + '...';
	});
</script>

<article class="post-card" class:compact>
	{#if showHeader}
		<!-- Post Header -->
		<header class="post-header">
			<div class="post-user">
				<Avatar class={compact ? 'w-8 h-8' : 'w-12 h-12'}>
					<AvatarImage src={post.seller.avatar_url} alt={post.seller.username} />
					<AvatarFallback>{post.seller.username.slice(0, 2).toUpperCase()}</AvatarFallback>
				</Avatar>

				<div class="post-user-info">
					<div class="post-username">
						<a href="/user/{post.seller.username}" class="username-link">
							{post.seller.username}
						</a>
						{#if post.seller.verified}
							<Badge variant="secondary">✓</Badge>
						{/if}
					</div>
					{#if !compact}
						<div class="post-location text-sm text-muted-foreground">
							{post.city || 'Bulgaria'}
						</div>
					{/if}
				</div>
			</div>

			<div class="post-header-actions">
				<span class="post-time text-sm text-muted-foreground">
					{timeAgo(post.created_at)}
				</span>
				<Button variant="ghost" size="sm" class="more-options">
					<MoreHorizontal size={16} />
				</Button>
			</div>
		</header>
	{/if}

	<!-- Post Media -->
	<div class="post-media" class:compact>
		{#if post.images && post.images.length > 0}
			<div class="media-container">
				<button 
					class="image-button"
					onclick={handleImageTap}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDoubleTap(e)}
					aria-label="Double-tap to like"
				>
					<img
						src={post.images[currentImageIndex]}
						alt={post.title}
						class="post-image img-product"
						loading="lazy"
						decoding="async"
						fetchpriority={currentImageIndex === 0 ? 'high' : 'low'}
					/>
				</button>

				<!-- Heart Burst Animation -->
				{#if showHeartBurst}
					<div class="heart-burst" aria-hidden="true">
						<svg width="80" height="80" viewBox="0 0 24 24" fill="none">
							<path 
								d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
								fill="var(--color-like)"
								stroke="#fff"
								stroke-width="1"
							/>
						</svg>
					</div>
				{/if}

				<!-- Price overlay -->
				<div class="price-overlay">
					<Badge variant="outline" style="background: rgba(0, 0, 0, 0.75); color: white; backdrop-filter: blur(4px);">
						€{post.price}
					</Badge>
				</div>

				<!-- Multiple images indicators -->
				{#if post.images.length > 1}
					<div class="media-indicators">
						{#each post.images as _, index}
							<button
								class="indicator"
								class:active={index === currentImageIndex}
								onclick={() => (currentImageIndex = index)}
								aria-label="View image {index + 1}"
							>
							</button>
						{/each}
					</div>

					<!-- Navigation arrows -->
					{#if currentImageIndex > 0}
						<button class="nav-arrow nav-prev" onclick={prevImage} aria-label="Previous image">
							‹
						</button>
					{/if}
					{#if currentImageIndex < post.images.length - 1}
						<button class="nav-arrow nav-next" onclick={nextImage} aria-label="Next image">
							›
						</button>
					{/if}
				{/if}
			</div>
		{:else}
			<div class="no-media">
				<div class="no-media-placeholder">📷</div>
				<p class="text-sm text-muted-foreground">No image available</p>
			</div>
		{/if}
	</div>

	{#if showActions}
		<!-- Action Bar -->
		<div class="post-actions">
			<div class="action-group-left">
				<Button
					variant="ghost"
					size="sm"
					class={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
					onclick={handleLike}
					aria-label={isLiked ? 'Unlike' : 'Like'}
				>
					<Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					class="action-btn"
					onclick={handleComment}
					aria-label="Comment"
				>
					<MessageCircle size={24} />
				</Button>

				<Button
					variant="ghost"
					size="sm"
					class="action-btn"
					onclick={handleShare}
					aria-label="Share"
				>
					<Share2 size={24} />
				</Button>
			</div>

			<div class="action-group-right">
				<Button
					variant="ghost"
					size="sm"
					class={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
					onclick={handleSave}
					aria-label={isSaved ? 'Unsave' : 'Save'}
				>
					<Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
				</Button>
			</div>
		</div>
	{/if}

	{#if showCaption}
		<!-- Post Caption -->
		<div class="post-caption">
			{#if post.like_count && post.like_count > 0}
				<div class="likes-count">
					<strong>{post.like_count.toLocaleString()} likes</strong>
				</div>
			{/if}

			<div class="caption-content">
				<strong class="post-author">{post.seller.username}</strong>
				<span class="caption-text">{displayCaption}</span>
				
				{#if post.description && post.description.length > MAX_CAPTION_LENGTH && !showFullCaption}
					<button 
						class="show-more-btn" 
						onclick={() => (showFullCaption = true)}
					>
						more
					</button>
				{/if}
			</div>

			<!-- Hashtags -->
			{#if post.tags && post.tags.length > 0}
				<div class="hashtags">
					{#each post.tags.slice(0, 3) as tag}
						<a href="/search?tag={tag}" class="hashtag">#{tag}</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if showComments}
		<!-- Comments Preview -->
		<div class="comments-preview">
			<button class="view-comments-btn text-sm text-muted-foreground">
				View all comments
			</button>
			<!-- Add comment previews here -->
		</div>
	{/if}
</article>

<style>
	.post-card {
		background: white;
		border: 1px solid var(--color-border-primary);
		border-radius: 12px;
		overflow: hidden;
		/* Performance optimizations */
		contain: layout style paint;
		will-change: transform;
		transform: translateZ(0); /* Force GPU acceleration */
	}

	.post-card.compact {
		border-radius: 8px;
	}

	/* Header */
	.post-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1rem 0.75rem;
	}

	.post-user {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.post-user-info {
		display: flex;
		flex-direction: column;
	}

	.post-username {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.username-link {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-decoration: none;
	}

	.username-link:hover {
		text-decoration: underline;
	}

	.post-header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Media */
	.post-media {
		position: relative;
		background: var(--color-surface-tertiary);
		aspect-ratio: 1 / 1;
	}

	.post-media.compact {
		aspect-ratio: 4 / 3;
	}

	.media-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.image-button {
		width: 100%;
		height: 100%;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		position: relative;
	}

	.post-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}

	/* Heart burst animation */
	.heart-burst {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: var(--z-low);
		animation: heartBurstAnimation 1s ease-out;
	}

	@keyframes heartBurstAnimation {
		0% {
			transform: translate(-50%, -50%) scale(0);
			opacity: 1;
		}
		15% {
			transform: translate(-50%, -50%) scale(1.3);
			opacity: 1;
		}
		30% {
			transform: translate(-50%, -50%) scale(1.1);
			opacity: 1;
		}
		70% {
			transform: translate(-50%, -50%) scale(1.2);
			opacity: 0.8;
		}
		100% {
			transform: translate(-50%, -50%) scale(0.8);
			opacity: 0;
		}
	}

	.price-overlay {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
	}

	.no-media {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-tertiary);
	}

	.no-media-placeholder {
		font-size: 2.25rem;
		margin-bottom: 0.5rem;
	}

	/* Media indicators */
	.media-indicators {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.25rem;
	}

	.indicator {
		width: 0.5rem;
		height: 0.5rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.indicator.active {
		width: 1.5rem;
		background: white;
	}

	/* Navigation arrows */
	.nav-arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 2rem;
		height: 2rem;
		background: rgba(0, 0, 0, 0.5);
		color: white;
		border-radius: 9999px;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		font-weight: bold;
		transition: all 0.2s;
	}

	.nav-arrow:hover {
		background: rgba(0, 0, 0, 0.7);
	}

	.nav-prev {
		left: 0.5rem;
	}

	.nav-next {
		right: 0.5rem;
	}

	/* Actions */
	.post-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
	}

	.action-group-left,
	.action-group-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	:global(.action-btn) {
		padding: 0.5rem;
		transition: all 0.2s;
	}

	:global(.action-btn:hover) {
		transform: scale(1.1);
	}

	:global(.like-btn.liked) {
		color: var(--color-text-error);
		animation: heartBeat 0.6s ease-in-out;
	}

	:global(.save-btn.saved) {
		color: var(--color-brand-blue);
	}

	@keyframes heartBeat {
		0%, 100% {
			transform: scale(1);
		}
		25% {
			transform: scale(1.2);
		}
		50% {
			transform: scale(1.1);
		}
	}

	/* Caption */
	.post-caption {
		padding: 0 1rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.likes-count {
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.caption-content {
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.post-author {
		font-weight: 600;
		margin-right: 0.5rem;
	}

	.caption-text {
		word-break: break-words;
	}

	.show-more-btn {
		color: var(--color-text-tertiary);
		margin-left: 0.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.show-more-btn:hover {
		text-decoration: underline;
	}

	/* Hashtags */
	.hashtags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.hashtag {
		font-size: 0.875rem;
		color: var(--color-brand-blue);
		text-decoration: none;
	}

	.hashtag:hover {
		text-decoration: underline;
	}

	/* Comments */
	.comments-preview {
		padding: 0 1rem 0.75rem;
	}

	.view-comments-btn {
		border: none;
		background: transparent;
		cursor: pointer;
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
	}

	.view-comments-btn:hover {
		text-decoration: underline;
	}
</style>