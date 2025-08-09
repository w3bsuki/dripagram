<script lang="ts">
	interface Props {
		product: any;
	}

	let { product }: Props = $props();
</script>

<!-- Title -->
<h3 class="product-title">{product.title || 'Untitled'}</h3>

<!-- Meta Info -->
<div class="meta-info">
	{#if product.size}
		<span class="meta-tag">Size {product.size}</span>
	{/if}
	{#if product.brand}
		<span class="meta-tag">{product.brand}</span>
	{/if}
</div>

<style>
	/* Title */
	.product-title {
		font-size: var(--font-size-13);
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		line-height: 1.2;
	}
	
	/* Meta Info */
	.meta-info {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}
	
	.meta-tag {
		font-size: var(--font-size-11);
		padding: 2px 6px;
		background: var(--color-secondary);
		color: var(--color-muted-foreground);
		border-radius: 4px;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.product-title {
			font-size: var(--font-size-xs);
		}
	}
</style>