<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy } from 'svelte';
	import { analytics } from '$lib/services/analytics';
	import type { FeedProduct } from '$lib/types';

	type FeedType = 'for-you' | 'following' | 'trending';

	let { 
		products,
		feedType,
		loadingMore,
		nextCursor,
		onLoadMore,
		onResize
	}: {
		products: FeedProduct[];
		feedType: FeedType;
		loadingMore: boolean;
		nextCursor: string | null;
		onLoadMore: () => Promise<void>;
		onResize?: (isMobile: boolean) => void;
	} = $props();

	let lastTrackedProducts = $state<string[]>([]);

	// Track views when products change (separate effect to avoid loops)
	$effect(() => {
		if (browser && products.length > 0) {
			// Get current product IDs
			const currentProductIds = products.map(p => p.id).filter(Boolean);
			
			// Check if products have actually changed
			const hasChanged = currentProductIds.some(id => !lastTrackedProducts.includes(id));
			
			if (hasChanged) {
				// Schedule view tracking after DOM updates
				const timer = setTimeout(() => {
					// Track only new products that haven't been tracked
					const newProductIds = currentProductIds
						.slice(0, 5)
						.filter(id => !lastTrackedProducts.includes(id));
					
					if (newProductIds.length > 0) {
						// Track product list view
						analytics.trackProductListView('feed_' + feedType, products
							.filter(p => newProductIds.includes(p.id))
							.map(p => ({
								$product_id: p.id,
								$product_name: p.title,
								$product_category: p.category,
								$product_brand: p.brand,
								$product_price: p.price,
								$currency: 'EUR',
								$seller_id: p.seller_id
							}))
						);
						lastTrackedProducts = [...lastTrackedProducts, ...newProductIds];
					}
				}, 500);
				
				return () => clearTimeout(timer);
			}
		}
	});

	onMount(() => {
		if (browser) {
			// Track initial page view - DISABLED: requires user consent
			// analytics.trackPageView('home_feed', { feed_type: feedType });
			
			// Setup mobile detection
			let isMobile = window.innerWidth < 768;
			if (onResize) onResize(isMobile);

			const handleResize = () => {
				isMobile = window.innerWidth < 768;
				if (onResize) onResize(isMobile);
			};

			// Setup infinite scroll
			const handleScroll = () => {
				if (loadingMore || !nextCursor) return;
				
				const scrollPosition = window.innerHeight + window.scrollY;
				const documentHeight = document.documentElement.scrollHeight;
				
				// Load more when user is 200px from bottom
				if (scrollPosition >= documentHeight - 200) {
					onLoadMore();
				}
			};
			
			window.addEventListener('resize', handleResize);
			window.addEventListener('scroll', handleScroll);
			
			return () => {
				window.removeEventListener('resize', handleResize);
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});
	
	onDestroy(() => {
		// Clean up analytics when component is destroyed - DISABLED: requires user consent
		// analytics.flush();
	});
</script>

<!-- This component has no visual output, it only manages state and side effects -->