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
	/* Stats & Price Row */
	.stats-price-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: auto;
		padding-top: 6px;
		border-top: 1px solid var(--color-border);
	}
	
	.stats {
		display: flex;
		gap: 12px;
	}
	
	.price-container {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	
	.price {
		font-size: var(--font-size-15);
		font-weight: 700;
		color: var(--color-foreground);
	}
	
	.original-price {
		font-size: var(--font-size-11);
		color: var(--color-muted-foreground);
		text-decoration: line-through;
	}
	
	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--font-size-13);
		color: var(--color-muted-foreground);
		font-weight: 500;
	}
	
	.stat :global(svg) {
		opacity: 0.7;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.price {
			font-size: var(--font-size-sm);
		}
		
		.stats {
			padding-top: 4px;
			gap: 10px;
		}
		
		.stat {
			font-size: var(--font-size-xs);
		}
	}
</style>