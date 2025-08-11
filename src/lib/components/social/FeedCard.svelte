<script lang="ts">
	import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag } from '@lucide/svelte';
	import { createClient } from '$lib/supabase/client';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { toast } from '$lib/utils/toast';
	import { goto } from '$app/navigation';
	import type { Listing } from '$lib/types';

	interface Props {
		item: Listing & {
			seller: {
				id: string;
				username: string;
				avatar_url: string;
				seller_verified: boolean;
				follower_count: number;
			};
			likes: { count: number }[];
			is_liked?: { user_id: string }[];
		};
	}

	let { item }: Props = $props();

	let liked = $state(item.is_liked && item.is_liked.length > 0);
	let likeCount = $state(item.likes?.[0]?.count || 0);
	let saved = $state(false);
	let showQuickShop = $state(false);
	let selectedSize = $state('');
	let imageIndex = $state(0);
	
	// Get auth context
	let auth: ReturnType<typeof getAuthContext> | null = null;
	let currentUser: any = null;
	try {
		auth = getAuthContext();
		currentUser = auth.user;
	} catch {
		auth = null;
		currentUser = null;
	}
	
	const supabase = createClient();

	async function toggleLike() {
		if (!auth?.user) {
			toast.error('Please login to like items');
			return;
		}

		const wasLiked = liked;
		liked = !liked;
		likeCount += liked ? 1 : -1;

		try {
			if (liked) {
				await supabase
					.from('listing_likes')
					.insert({ user_id: auth.user!.id, listing_id: item.id });
			} else {
				await supabase
					.from('listing_likes')
					.delete()
					.match({ user_id: auth.user!.id, listing_id: item.id });
			}
		} catch (err) {
			// Revert on error
			liked = wasLiked;
			likeCount += wasLiked ? 1 : -1;
			toast.error('Failed to update like');
		}
	}

	async function toggleSave() {
		if (!auth?.user) {
			toast.error('Please login to save items');
			return;
		}

		saved = !saved;

		try {
			if (saved) {
				await supabase.from('wishlists').insert({ user_id: auth.user!.id, listing_id: item.id });
				toast.success('Added to wishlist');
			} else {
				await supabase
					.from('wishlists')
					.delete()
					.match({ user_id: auth.user!.id, listing_id: item.id });
			}
		} catch (err) {
			saved = !saved;
			toast.error('Failed to update wishlist');
		}
	}

	function share() {
		if (navigator.share) {
			navigator.share({
				title: item.title,
				text: `Check out ${item.title} on Driplo`,
				url: `/products/${item.id}`,
			});
		} else {
			// Fallback to copy link
			navigator.clipboard.writeText(`${window.location.origin}/products/${item.id}`);
			toast.success('Link copied to clipboard');
		}
	}

	async function quickMessage() {
		if (!currentUser) {
			goto('/auth/login');
			return;
		}
		
		showQuickShop = false;
		
		// Ensure we have seller information
		if (!item.seller?.id) {
			console.error('No seller information available');
			return;
		}
		
		try {
			// Create or find existing conversation with seller
			const response = await fetch('/api/messages/conversation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					otherUserId: item.seller.id,
					productId: item.id
				})
			});
			
			if (!response.ok) {
				throw new Error('Failed to create conversation');
			}
			
			const { conversationId } = await response.json();
			
			// Navigate to the specific conversation
			goto(`/messages/${conversationId}`);
			
		} catch (error) {
			console.error('Failed to start conversation:', error);
			// Fallback to general messages page
			goto('/messages');
		}
	}

	function handleImageSwipe(direction: 'left' | 'right') {
		if (!item.images || item.images.length <= 1) return;

		if (direction === 'right' && imageIndex < item.images.length - 1) {
			imageIndex++;
		} else if (direction === 'left' && imageIndex > 0) {
			imageIndex--;
		}
	}
</script>

<article class="feed-card">
	<!-- Seller Header -->
	<header class="card-header">
		<a href="/profile/{item.seller.username}" class="seller-info">
			<img
				src={item.seller.avatar_url || '/default-avatar.png'}
				alt={item.seller.username}
				class="seller-avatar"
			/>
			<div>
				<div class="seller-name">
					{item.seller.username}
					{#if item.seller.seller_verified}
						<span class="verified-badge">✓</span>
					{/if}
				</div>
				<div class="seller-followers">{item.seller.follower_count} followers</div>
			</div>
		</a>
		<button class="follow-button">Follow</button>
	</header>

	<!-- Product Image(s) -->
	<div 
		class="image-container" 
		role="button"
		tabindex="0"
		ondblclick={toggleLike}
		onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleLike()}
		aria-label="Double-click to like product"
	>
		{#if item.video_url}
			<video
				src={item.video_url}
				poster={item.thumbnail_url}
				controls
				playsinline
				class="product-media"
			>
				<track kind="captions" srclang="en" label="English captions" />
			</video>
		{:else if item.images && item.images.length > 0}
			<img
				src={item.images[imageIndex] || item.thumbnail_url}
				alt={item.title}
				class="product-media"
				loading="lazy"
			/>

			{#if item.images.length > 1}
				<div class="image-indicators">
					{#each item.images as _, i}
						<span class="indicator {i === imageIndex ? 'active' : ''}"></span>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="no-image">No image available</div>
		{/if}

		<!-- Price Tag -->
		<div class="price-tag">
			€{item.price}
		</div>

		<!-- Quick Shop -->
		{#if showQuickShop}
			<div 
				class="quick-shop-overlay" 
				role="button"
				tabindex="0"
				onclick={() => (showQuickShop = false)}
				onkeydown={(e) => e.key === 'Escape' && (showQuickShop = false)}
				aria-label="Close quick shop"
			>
				<div 
					class="quick-shop-modal" 
					role="dialog"
					aria-modal="true"
					tabindex="0"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
				>
					<h3>{item.title}</h3>
					<p class="price">€{item.price}</p>

					{#if item.size}
						<div class="size-selector">
							<label for="size-select-{item.id}">Size:</label>
							<select id="size-select-{item.id}" bind:value={selectedSize}>
								<option value="">Select size</option>
								<option value={item.size}>{item.size}</option>
							</select>
						</div>
					{/if}

					<button class="message-btn" onclick={quickMessage}> Message </button>
				</div>
			</div>
		{/if}
	</div>

	<!-- Engagement Bar -->
	<div class="engagement-bar">
		<div class="left-actions">
			<button class="action-btn {liked ? 'liked' : ''}" onclick={toggleLike} aria-label="Like">
				<Heart size={24} fill={liked ? 'currentColor' : 'none'} />
			</button>
			<button class="action-btn" aria-label="Comment">
				<MessageCircle size={24} />
			</button>
			<button class="action-btn" onclick={share} aria-label="Share">
				<Share2 size={24} />
			</button>
		</div>
		<div class="right-actions">
			<button class="action-btn" onclick={() => (showQuickShop = true)} aria-label="Quick shop">
				<ShoppingBag size={24} />
			</button>
			<button class="action-btn {saved ? 'saved' : ''}" onclick={toggleSave} aria-label="Save">
				<Bookmark size={24} fill={saved ? 'currentColor' : 'none'} />
			</button>
		</div>
	</div>

	<!-- Like Count -->
	{#if likeCount > 0}
		<div class="like-count">{likeCount} likes</div>
	{/if}

	<!-- Product Info -->
	<div class="product-info">
		<h3 class="product-title">
			<a href="/products/{item.id}">{item.title}</a>
		</h3>
		<p class="product-description">{item.description}</p>

		{#if item.tags && item.tags.length > 0}
			<div class="hashtags">
				{#each item.tags.slice(0, 3) as tag}
					<a href="/search?tag={tag}" class="hashtag">#{tag}</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Timestamp -->
	<time class="timestamp">
		{new Date(item.created_at).toRelativeTime()}
	</time>
</article>

<style>
	.feed-card {
		background: var(--color-background);
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
	}

	.seller-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-name {
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.verified-badge {
		color: var(--color-verified);
		font-size: 0.875rem;
	}

	.seller-followers {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.follow-button {
		background: var(--color-primary);
		color: white;
		border: none;
		padding: 0.375rem 1rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.follow-button:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
	}

	.image-container {
		position: relative;
		aspect-ratio: 4/5;
		overflow: hidden;
		background: var(--color-surface);
	}

	.product-media {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.no-image {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-secondary);
	}

	.image-indicators {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.25rem;
	}

	.indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.5);
		transition: all 0.2s;
	}

	.indicator.active {
		background: white;
		width: 20px;
		border-radius: 3px;
	}

	.price-tag {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.375rem 0.75rem;
		border-radius: 999px;
		font-weight: 600;
		backdrop-filter: blur(10px);
	}

	.engagement-bar {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
	}

	.left-actions,
	.right-actions {
		display: flex;
		gap: 0.75rem;
	}

	.action-btn {
		background: none;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		padding: 0.5rem;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		transform: scale(1.1);
	}

	.action-btn.liked {
		color: #e0245e;
		animation: heartBeat 0.6s;
	}

	.action-btn.saved {
		color: var(--color-primary);
	}

	@keyframes heartBeat {
		0%,
		100% {
			transform: scale(1);
		}
		25% {
			transform: scale(1.3);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.like-count {
		padding: 0 1rem;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.product-info {
		padding: 0 1rem 0.5rem;
	}

	.product-title {
		margin: 0.25rem 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.product-title a {
		text-decoration: none;
		color: inherit;
	}

	.product-description {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		margin: 0.25rem 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.hashtags {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
		flex-wrap: wrap;
	}

	.hashtag {
		color: var(--color-primary);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.hashtag:hover {
		text-decoration: underline;
	}

	.timestamp {
		display: block;
		padding: 0 1rem 1rem;
		color: var(--color-text-secondary);
		font-size: 0.75rem;
	}

	/* Quick Shop Modal */
	.quick-shop-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-higher);
		animation: fadeIn 0.2s;
	}

	.quick-shop-modal {
		background: var(--color-background);
		padding: 2rem;
		border-radius: 12px;
		max-width: 90%;
		width: 400px;
		animation: slideUp 0.3s;
	}

	.quick-shop-modal h3 {
		margin: 0 0 1rem;
	}

	.quick-shop-modal .price {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: 1rem;
	}

	.size-selector {
		margin-bottom: 1.5rem;
	}

	.size-selector label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.size-selector select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-background);
	}

	.message-btn {
		width: 100%;
		background: var(--color-accent);
		color: var(--color-text-primary);
		border: none;
		padding: 1rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.message-btn:hover {
		background: #ffd93d;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 224, 102, 0.3);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
