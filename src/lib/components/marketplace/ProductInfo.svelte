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
	/* Title - Cleaner typography */
	.product-title {
		font-size: 0.875rem; /* 14px - not too bold */
		font-weight: 500; /* Medium weight, not semibold */
		color: oklch(0.2 0 0); /* Pure OKLCH black */
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		line-height: 1.3;
		letter-spacing: -0.01em; /* Tighter tracking */
	}
	
	/* Meta Info */
	.meta-info {
		display: flex;
		gap: 4px; /* Tighter gap */
		flex-wrap: wrap;
	}
	
	.meta-tag {
		font-size: 0.6875rem; /* 11px */
		padding: 2px 5px;
		background: oklch(0.97 0 0); /* Light gray */
		color: oklch(0.5 0 0); /* Medium gray */
		border-radius: 4px;
		font-weight: 400;
		letter-spacing: 0.01em;
	}
	
	/* Mobile Optimizations */
	@media (max-width: 640px) {
		.product-title {
			font-size: 0.8125rem; /* 13px on mobile */
		}
	}
</style>