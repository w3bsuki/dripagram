<script lang="ts">
	import { Heart, Eye } from '@lucide/svelte';
	import type { LikeState } from '$lib/utils/likeLogic';

	interface Props {
		product: any;
		likeState: LikeState;
	}

	let { product, likeState }: Props = $props();

	let price = $derived(
		new Intl.NumberFormat('bg-BG', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(product.price || 0)
	);

	let viewCount = $derived(product.views || product.view_count || 0);
</script>

<!-- Stats & Price Row -->
<div class="stats-price-row">
	<div class="stats">
		<span class="stat">
			<Heart size={14} />
			{likeState.likeCount}
		</span>
		<span class="stat">
			<Eye size={14} />
			{viewCount}
		</span>
	</div>
	<div class="price-container">
		<span class="price">{price} лв</span>
		{#if product.original_price && product.original_price > product.price}
			<span class="original-price">
				{new Intl.NumberFormat('bg-BG').format(product.original_price)} лв
			</span>
		{/if}
	</div>
</div>

<style>
	/* Stats & Price Row - Cleaner layout */
	.stats-price-row {
		display: flex;
		justify-content: space-between;
		align-items: center; /* Center align instead of flex-end */
		margin-top: 4px;
		padding-top: 4px;
		border-top: 1px solid oklch(0.95 0 0 / 0.5); /* Subtle border */
	}
	
	.stats {
		display: flex;
		gap: 10px; /* Tighter gap */
	}
	
	.price-container {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	
	.price {
		font-size: 1rem; /* 16px - clear readable price */
		font-weight: 600; /* Semibold, not bold */
		color: oklch(0.15 0 0); /* Almost black */
		letter-spacing: -0.02em; /* Tighter for numbers */
	}
	
	.original-price {
		font-size: var(--font-size-11);
		color: var(--color-muted-foreground);
		text-decoration: line-through;
	}
	
	.stat {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 0.75rem; /* 12px - subtle stats */
		color: oklch(0.6 0 0); /* Medium gray */
		font-weight: 400; /* Regular weight */
	}
	
	.stat :global(svg) {
		opacity: 0.7;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.price {
			font-size: 0.9375rem; /* 15px on mobile */
		}
		
		.stats {
			padding-top: 4px;
			gap: 10px;
		}
		
		.stat {
			font-size: 0.6875rem; /* 11px on mobile */
		}
	}
</style>