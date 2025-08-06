<script lang="ts">
	import { Heart, MessageCircle, Share2, Bookmark, ShoppingBag, Eye } from '@lucide/svelte';

	interface Props {
		isLiked?: boolean;
		likesCount: number;
		saved?: boolean;
		variant?: 'grid' | 'feed' | 'compact';
		showQuickShop?: boolean;
		showEngagement?: boolean;
		onToggleLike?: () => void;
		onToggleSave?: () => void;
		onShare?: () => void;
		onQuickShop?: () => void;
	}

	let {
		isLiked = false,
		likesCount,
		saved = false,
		variant = 'grid',
		showQuickShop = false,
		showEngagement = false,
		onToggleLike,
		onToggleSave,
		onShare,
		onQuickShop,
	}: Props = $props();

	function handleLike(e?: Event) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		onToggleLike?.();
	}

	function handleSave() {
		onToggleSave?.();
	}

	function handleShare() {
		onShare?.();
	}

	function handleQuickShop(e?: Event) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		onQuickShop?.();
	}
</script>

{#if variant === 'feed' && showEngagement}
	<!-- Feed Style Actions Bar -->
	<div class="action-bar-instagram">
		<div class="flex items-center gap-4">
			<button
				onclick={handleLike}
				class="action-btn-instagram like-button {isLiked ? 'liked' : ''}"
				aria-label="{isLiked ? 'Unlike' : 'Like'} this post"
			>
				<Heart size={24} class={isLiked ? 'text-danger fill-current' : 'text-secondary'} />
			</button>
			<button class="action-btn-instagram" aria-label="Comment">
				<MessageCircle size={24} class="text-secondary" />
			</button>
			<button onclick={handleShare} class="action-btn-instagram" aria-label="Share">
				<Share2 size={24} class="text-secondary" />
			</button>
		</div>
		<button
			onclick={handleSave}
			class="action-btn-instagram"
			aria-label="{saved ? 'Unsave' : 'Save'} this post"
		>
			<Bookmark size={24} class={saved ? 'text-brand fill-current' : 'text-secondary'} />
		</button>
	</div>

	<!-- Likes Count -->
	{#if likesCount > 0}
		<div class="px-4 pb-2">
			<div class="text-primary text-sm font-semibold">
				{likesCount.toLocaleString()} likes
			</div>
		</div>
	{/if}
{:else if variant === 'grid'}
	<!-- Grid Style Hover Overlay -->
	<div
		class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100"
	>
		<div class="text-inverse flex items-center gap-6">
			<div class="flex items-center gap-2">
				<Heart size={20} fill="currentColor" />
				<span class="font-semibold">{likesCount}</span>
			</div>
			<div class="flex items-center gap-2">
				<Eye size={20} />
				<span class="font-semibold">View</span>
			</div>
		</div>
	</div>

	<!-- Action Buttons Overlay -->
	<div
		class="absolute top-3 right-3 flex translate-y-2 transform flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
	>
		<button onclick={handleLike} class="action-button" aria-label="Like">
			<Heart size={16} class={isLiked ? 'text-danger fill-current' : 'text-secondary'} />
		</button>

		{#if showQuickShop}
			<button
				onclick={handleQuickShop}
				class="action-button bg-interactive-primary text-inverse hover:bg-interactive-primary-hover"
				aria-label="Quick shop"
			>
				<ShoppingBag size={16} />
			</button>
		{/if}
	</div>
{/if}
