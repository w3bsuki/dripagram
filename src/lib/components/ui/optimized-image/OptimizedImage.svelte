<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	interface Props {
		src: string;
		alt: string;
		width?: number;
		height?: number;
		aspectRatio?: number;
		sizes?: string;
		priority?: boolean;
		loading?: 'lazy' | 'eager';
		class?: string;
		layout?: 'cover' | 'contain' | 'fill';
		onLoad?: () => void;
		onError?: () => void;
	}

	let {
		src,
		alt,
		width = 400,
		height = 400,
		aspectRatio = 1,
		sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
		priority = false,
		loading = 'lazy',
		class: className = '',
		layout = 'cover',
		onLoad,
		onError
	}: Props = $props();

	let imageRef: HTMLElement;
	let isIntersecting = $state(false);
	let hasLoaded = $state(false);
	let hasError = $state(false);
	let observer: IntersectionObserver | null = null;

	// Calculate dimensions based on aspect ratio
	const calculatedHeight = $derived(aspectRatio ? width / aspectRatio : height);

	// Enhanced lazy loading with intersection observer
	onMount(() => {
		if (browser && !priority && loading === 'lazy') {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							isIntersecting = true;
							observer?.unobserve(entry.target);
						}
					});
				},
				{
					rootMargin: '50px' // Start loading 50px before entering viewport
				}
			);

			if (imageRef) {
				observer.observe(imageRef);
			}
		} else {
			// Load immediately for priority images
			isIntersecting = true;
		}

		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});

	function handleLoad() {
		hasLoaded = true;
		onLoad?.();
	}

	function handleError() {
		hasError = true;
		onError?.();
	}

	// Should load image?
	const shouldLoad = $derived(priority || isIntersecting);
	
	// Final image source with fallback
	const imageSrc = $derived(hasError ? '/placeholder.jpg' : src);
</script>

<div 
	bind:this={imageRef}
	class="optimized-image-container {className}"
	style:aspect-ratio={aspectRatio}
>
	{#if shouldLoad}
		<img
			src={imageSrc}
			{alt}
			{width}
			height={calculatedHeight}
			loading={priority ? 'eager' : 'lazy'}
			decoding={priority ? 'sync' : 'async'}
			fetchpriority={priority ? 'high' : 'auto'}
			{sizes}
			class="optimized-image {layout} {hasLoaded ? 'loaded' : ''}"
			onload={handleLoad}
			onerror={handleError}
		/>
	{:else}
		<!-- Placeholder while not in viewport -->
		<div 
			class="image-placeholder"
			style:width="{width}px"
			style:height="{calculatedHeight}px"
			aria-label="Loading {alt}"
		>
			<div class="placeholder-spinner"></div>
		</div>
	{/if}
</div>

<style>
	.optimized-image-container {
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-gray-50);
		contain: layout style;
	}

	.optimized-image {
		transition: opacity 300ms ease;
		opacity: 0;
		width: 100%;
		height: 100%;
	}

	.optimized-image.loaded {
		opacity: 1;
	}

	.optimized-image.cover {
		object-fit: cover;
	}

	.optimized-image.contain {
		object-fit: contain;
	}

	.optimized-image.fill {
		object-fit: fill;
	}

	.image-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-gray-100);
		color: var(--color-gray-400);
		width: 100%;
		height: 100%;
	}

	.placeholder-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-gray-300);
		border-top: 2px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.optimized-image {
			transition: opacity 150ms ease;
		}
		.placeholder-spinner {
			animation: none;
		}
	}
</style>