<script lang="ts">
	import { Heart, MessageCircle, Send, Bookmark } from '@lucide/svelte';
	
	interface Props {
		liked?: boolean;
		saved?: boolean;
		likeCount?: number;
		commentCount?: number;
		showCounts?: boolean;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
		onLike?: (liked: boolean) => void;
		onComment?: () => void;
		onShare?: () => void;
		onSave?: (saved: boolean) => void;
	}
	
	let {
		liked = false,
		saved = false,
		likeCount = 0,
		commentCount = 0,
		showCounts = true,
		size = 'md',
		class: className = '',
		onLike,
		onComment,
		onShare,
		onSave
	}: Props = $props();
	
	let likeAnimating = $state(false);
	let localLiked = $state(liked);
	let localSaved = $state(saved);
	let localLikeCount = $state(likeCount);
	
	$effect(() => {
		localLiked = liked;
		localLikeCount = likeCount;
		localSaved = saved;
	});
	
	const iconSizes = {
		sm: 20,
		md: 24,
		lg: 28
	};
	
	function handleLike() {
		likeAnimating = true;
		localLiked = !localLiked;
		localLikeCount += localLiked ? 1 : -1;
		onLike?.(localLiked);
		
		setTimeout(() => {
			likeAnimating = false;
		}, 400);
	}
	
	function handleComment() {
		onComment?.();
	}
	
	function handleShare() {
		onShare?.();
	}
	
	function handleSave() {
		localSaved = !localSaved;
		onSave?.(localSaved);
	}
	
	function formatCount(count: number): string {
		if (count >= 1000000) {
			return `${(count / 1000000).toFixed(1)}M`;
		} else if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}K`;
		}
		return count.toString();
	}
</script>

<div class="action-bar {className}">
	<div class="action-group left">
		<button 
			class="action-btn like-btn {likeAnimating ? 'animating' : ''}"
			onclick={handleLike}
			aria-label={localLiked ? 'Unlike' : 'Like'}
		>
			{#if localLiked}
				<Heart size={iconSizes[size]} fill="currentColor" class="liked" />
			{:else}
				<Heart size={iconSizes[size]} />
			{/if}
		</button>
		
		<button 
			class="action-btn"
			onclick={handleComment}
			aria-label="Comment"
		>
			<MessageCircle size={iconSizes[size]} />
		</button>
		
		<button 
			class="action-btn"
			onclick={handleShare}
			aria-label="Share"
		>
			<Send size={iconSizes[size]} />
		</button>
	</div>
	
	<div class="action-group right">
		<button 
			class="action-btn save-btn"
			onclick={handleSave}
			aria-label={localSaved ? 'Unsave' : 'Save'}
		>
			{#if localSaved}
				<Bookmark size={iconSizes[size]} fill="currentColor" />
			{:else}
				<Bookmark size={iconSizes[size]} />
			{/if}
		</button>
	</div>
</div>

{#if showCounts && (localLikeCount > 0 || commentCount > 0)}
	<div class="action-counts">
		{#if localLikeCount > 0}
			<span class="like-count">
				<strong>{formatCount(localLikeCount)}</strong> {localLikeCount === 1 ? 'like' : 'likes'}
			</span>
		{/if}
		{#if commentCount > 0}
			<span class="comment-count">
				{formatCount(commentCount)} {commentCount === 1 ? 'comment' : 'comments'}
			</span>
		{/if}
	</div>
{/if}

<style>
	.action-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0;
	}
	
	.action-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	
	.action-btn {
		background: none;
		border: none;
		color: var(--color-gray-900);
		cursor: pointer;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		border-radius: 50%;
		position: relative;
	}
	
	.action-btn:hover {
		opacity: 0.7;
		transform: scale(1.1);
	}
	
	.action-btn:active {
		transform: scale(0.95);
	}
	
	.like-btn :global(.liked) {
		color: var(--color-danger);
	}
	
	.like-btn.animating {
		animation: heartBeat 0.4s ease;
	}
	
	@keyframes heartBeat {
		0% { transform: scale(1); }
		25% { transform: scale(1.3); }
		50% { transform: scale(0.95); }
		75% { transform: scale(1.15); }
		100% { transform: scale(1); }
	}
	
	.save-btn :global(svg[fill="currentColor"]) {
		color: var(--color-gray-900);
	}
	
	.action-counts {
		padding: 0 0.5rem;
		margin-top: 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		font-size: 0.875rem;
		color: var(--color-gray-900);
	}
	
	.like-count strong {
		font-weight: 600;
	}
	
	.comment-count {
		color: var(--color-gray-500);
		font-size: 0.8125rem;
	}
</style>