<script lang="ts">
	import type { ProductContextProps } from '$lib/types/messaging';

	let { product, onProductClick }: ProductContextProps = $props();
</script>

<div class="product-context">
	<button class="product-link" onclick={onProductClick}>
		<img src={product.images[0]} alt={product.title} class="product-image" />
		<div class="product-info">
			<span class="product-title">{product.title}</span>
			<span class="product-price">{product.price}лв</span>
		</div>
	</button>
</div>

<style>
	.product-context {
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-gray-50);
	}

	.product-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--color-surface-primary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		width: 100%;
		text-align: left;
	}

	.product-link:hover {
		box-shadow:
			0 4px 6px -1px var(--color-primitive-black) / 10,
			0 2px 4px -1px var(--color-primitive-black) / 6;
		transform: translateY(-1px);
	}

	.product-image {
		width: 48px;
		height: 48px;
		border-radius: 6px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.product-info {
		flex: 1;
		min-width: 0;
	}

	.product-title {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-price {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-primary);
	}
</style>
