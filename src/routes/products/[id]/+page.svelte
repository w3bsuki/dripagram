<script lang="ts">
	import { ProductDetail, ProductGrid, ProductHorizontalScroll } from '$lib/components/marketplace';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	
	let product = $derived(data?.product);
	let isLiked = $derived(data?.isLiked || false);
	let isSaved = $derived(data?.isSaved || false);
	let relatedProducts = $derived(data?.relatedProducts || []);
	let similarProducts = $derived(data?.similarProducts || []);
</script>

<svelte:head>
	<title>{product?.title || 'Product'} - Driplo</title>
	<meta name="description" content={product?.description || 'Shop unique fashion on Driplo'} />
	<meta property="og:title" content={product?.title || 'Product'} />
	<meta property="og:description" content={product?.description || 'Shop unique fashion on Driplo'} />
	<meta property="og:image" content={product?.thumbnail_url || product?.images?.[0] || ''} />
</svelte:head>

{#if product}
	<ProductDetail {product} {relatedProducts} {isLiked} {isSaved} />
	
	{#if relatedProducts.length > 0}
		<section class="related-section">
			<ProductHorizontalScroll 
				products={relatedProducts.slice(0, 8)} 
				title="More from this seller" 
			/>
		</section>
	{/if}
	
	{#if similarProducts.length > 0}
		<section class="similar-section">
			<ProductHorizontalScroll 
				products={similarProducts.slice(0, 8)} 
				title="Similar products" 
			/>
		</section>
	{/if}
{:else}
	<div class="not-found">
		<h1>Product not found</h1>
		<p>This product might have been removed or doesn't exist.</p>
		<a href="/" class="back-link">Back to home</a>
	</div>
{/if}

<style>
	.related-section,
	.similar-section {
		width: 100%;
		padding: 8px 0 16px 0;
		border-top: 1px solid #f1f3f4;
		background: #ffffff;
		margin-top: -80px;
	}
	
	.not-found {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 24px;
		text-align: center;
	}
	
	.not-found h1 {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-foreground);
		margin: 0 0 8px 0;
	}
	
	.not-found p {
		font-size: var(--font-size-sm);
		color: var(--color-muted-foreground);
		margin: 0 0 24px 0;
	}
	
	.back-link {
		padding: 12px 24px;
		background: var(--color-foreground);
		color: var(--color-background);
		text-decoration: none;
		font-size: var(--font-size-sm);
		font-weight: 600;
		border-radius: 6px;
	}
	
	@media (min-width: 768px) {
		.section-title {
			padding: 0 24px;
		}
	}
</style>