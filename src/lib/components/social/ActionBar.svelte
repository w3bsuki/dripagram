<!--
ActionBar - Instagram-style action bar component
Reusable action bar with like, comment, share, save actions
Can be used in PostCard, FeedCard, or standalone
-->
<script lang="ts">
	import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag, Send } from '@lucide/svelte';
	import Button from '$lib/components/ui/button';

	interface Props {
		// State
		isLiked?: boolean;
		isSaved?: boolean;
		likeCount?: number;
		commentCount?: number;
		// Handlers
		onLike?: () => void;
		onComment?: () => void;
		onShare?: () => void;
		onSave?: () => void;
		onShop?: () => void;
		onSend?: () => void;
		// Customization
		showLikeCount?: boolean;
		showCommentCount?: boolean;
		showShop?: boolean;
		showSend?: boolean;
		variant?: 'default' | 'compact' | 'minimal';
		alignment?: 'left' | 'center' | 'space-between';
	}

	let {
		isLiked = false,
		isSaved = false,
		likeCount = 0,
		commentCount = 0,
		onLike,
		onComment,
		onShare,
		onSave,
		onShop,
		onSend,
		showLikeCount = true,
		showCommentCount = false,
		showShop = false,
		showSend = false,
		variant = 'default',
		alignment = 'space-between'
	}: Props = $props();

	// Internal state for animations
	let isLikeAnimating = $state(false);
	let isSaveAnimating = $state(false);

	function handleLike() {
		if (!onLike) return;
		isLikeAnimating = true;
		onLike();
		// Reset animation after duration
		setTimeout(() => {
			isLikeAnimating = false;
		}, 600);
	}

	function handleSave() {
		if (!onSave) return;
		isSaveAnimating = true;
		onSave();
		setTimeout(() => {
			isSaveAnimating = false;
		}, 300);
	}

	// Format count for display
	function formatCount(count: number): string {
		if (count === 0) return '';
		if (count < 1000) return count.toString();
		if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
		return `${(count / 1000000).toFixed(1)}m`;
	}
</script>

<div class="action-bar {variant} {alignment}">
	<!-- Primary Actions (Left side) -->
	<div class="action-group primary-actions">
		<!-- Like Button -->
		<div class="action-item">
			<Button
				variant="ghost"
				size={variant === 'compact' ? 'sm' : 'default'}
				class={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
				onclick={handleLike}
				aria-label={isLiked ? 'Unlike' : 'Like'}
				disabled={!onLike}
			>
				<Heart 
					size={variant === 'compact' ? 20 : 24} 
					fill={isLiked ? 'currentColor' : 'none'} 
				/>
			</Button>
			
			{#if showLikeCount && likeCount > 0}
				<span class="action-count like-count">
					{formatCount(likeCount)}
				</span>
			{/if}
		</div>

		<!-- Comment Button -->
		<div class="action-item">
			<Button
				variant="ghost"
				size={variant === 'compact' ? 'sm' : 'default'}
				class="action-btn comment-btn"
				onclick={onComment}
				aria-label="Comment"
				disabled={!onComment}
			>
				<MessageCircle size={variant === 'compact' ? 20 : 24} />
			</Button>
			
			{#if showCommentCount && commentCount > 0}
				<span class="action-count comment-count">
					{formatCount(commentCount)}
				</span>
			{/if}
		</div>

		<!-- Share/Send Button -->
		{#if showSend}
			<Button
				variant="ghost"
				size={variant === 'compact' ? 'sm' : 'default'}
				class="action-btn send-btn"
				onclick={onSend}
				aria-label="Send"
				disabled={!onSend}
			>
				<Send size={variant === 'compact' ? 20 : 24} />
			</Button>
		{:else}
			<Button
				variant="ghost"
				size={variant === 'compact' ? 'sm' : 'default'}
				class="action-btn share-btn"
				onclick={onShare}
				aria-label="Share"
				disabled={!onShare}
			>
				<Share2 size={variant === 'compact' ? 20 : 24} />
			</Button>
		{/if}
	</div>

	<!-- Secondary Actions (Right side) -->
	<div class="action-group secondary-actions">
		<!-- Shop Button (for commerce items) -->
		{#if showShop}
			<Button
				variant="ghost"
				size={variant === 'compact' ? 'sm' : 'default'}
				class="action-btn shop-btn"
				onclick={onShop}
				aria-label="Shop"
				disabled={!onShop}
			>
				<ShoppingBag size={variant === 'compact' ? 20 : 24} />
			</Button>
		{/if}

		<!-- Save/Bookmark Button -->
		<Button
			variant="ghost"
			size={variant === 'compact' ? 'sm' : 'default'}
			class={`action-btn save-btn ${isSaved ? 'saved' : ''} ${isSaveAnimating ? 'animating' : ''}`}
			onclick={handleSave}
			aria-label={isSaved ? 'Unsave' : 'Save'}
			disabled={!onSave}
		>
			<Bookmark 
				size={variant === 'compact' ? 20 : 24} 
				fill={isSaved ? 'currentColor' : 'none'} 
			/>
		</Button>
	</div>
</div>

<!-- Like count display (Instagram style) -->
{#if variant !== 'minimal' && showLikeCount && likeCount > 0}
	<div class="likes-display">
		<strong>{likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}</strong>
	</div>
{/if}

<style>
	.action-bar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
	}

	.action-bar.space-between {
		justify-content: space-between;
	}

	.action-bar.left {
		justify-content: flex-start;
	}

	.action-bar.center {
		justify-content: center;
	}

	.action-bar.compact {
		padding: 0.25rem;
	}

	.action-bar.minimal {
		padding: 0;
	}

	.action-group {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.action-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	:global(.action-btn) {
		transition: all 200ms;
	}
	
	:global(.action-btn:hover) {
		transform: scale(1.1);
	}

	:global(.action-btn:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	:global(.action-btn:disabled:hover) {
		transform: scale(1);
	}

	/* Like button states */
	:global(.like-btn.liked) {
		color: var(--color-text-error);
	}

	:global(.like-btn.animating) {
		animation: heartBeat 0.6s ease-in-out;
	}

	@keyframes heartBeat {
		0%, 100% {
			transform: scale(1);
		}
		25% {
			transform: scale(1.3);
		}
		50% {
			transform: scale(1.1);
		}
		75% {
			transform: scale(1.2);
		}
	}

	/* Save button states */
	:global(.save-btn.saved) {
		color: var(--color-primary);
	}

	:global(.save-btn.animating) {
		animation: bounceIn 0.3s ease-out;
	}

	@keyframes bounceIn {
		0% {
			transform: scale(0.8);
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
		}
	}

	/* Action counts */
	.action-count {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.like-count {
		color: var(--color-text-error);
	}

	/* Likes display */
	.likes-display {
		padding: 0 0.5rem 0.25rem;
		font-size: 0.875rem;
	}

	/* Hover effects for specific actions */
	:global(.comment-btn:hover) {
		color: var(--color-text-brand);
	}

	:global(.share-btn:hover) {
		color: var(--color-text-success);
	}

	:global(.shop-btn:hover) {
		color: var(--color-text-warning);
	}

	:global(.send-btn:hover) {
		color: var(--color-text-brand);
	}

	/* Compact variant adjustments */
	.compact .action-group {
		gap: 0.125rem;
	}

	.compact .action-item {
		gap: 0.125rem;
	}

	/* Minimal variant adjustments */
	.minimal :global(.action-btn) {
		padding: 0.25rem;
	}
</style>