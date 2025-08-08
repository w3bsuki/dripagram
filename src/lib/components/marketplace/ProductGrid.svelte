<script lang="ts">
	import ProductCard from './ProductCard.svelte';
	// Product type - using any for now since database structure is unclear
	type Product = any;
	
	interface Props {
		products: Product[];
	}
	
	let { products = [] }: Props = $props();
</script>

<div class="product-grid">
	{#each products as product (product.id)}
		<ProductCard {product} />
	{/each}
	
	{#if products.length === 0}
		<div class="empty-state">
			<p>No products available</p>
		</div>
	{/if}
</div>

<style>
	.product-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
		padding: 16px;
	}
	
	@media (min-width: 768px) {
		.product-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 24px;
			padding: 24px;
		}
	}
	
	@media (min-width: 1024px) {
		.product-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
	
	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 48px 16px;
		color: var(--color-muted-foreground);
	}
</style>