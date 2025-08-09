<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, tick } from 'svelte';

	interface Props {
		items: any[];
		height: number;
		itemHeight?: number;
		overscan?: number;
		class?: string;
		children?: any;
	}

	let {
		items,
		height,
		itemHeight = 200,
		overscan = 3,
		class: className = '',
		children
	}: Props = $props();

	let scrollElement: HTMLDivElement;
	let scrollTop = $state(0);
	let containerHeight = $state(height);
	
	// Calculate visible range
	const startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));
	const endIndex = $derived(
		Math.min(
			items.length - 1,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
		)
	);
	const visibleItems = $derived(items.slice(startIndex, endIndex + 1));

	// Virtual list metrics
	const totalHeight = $derived(items.length * itemHeight);
	const offsetY = $derived(startIndex * itemHeight);

	let isScrolling = $state(false);
	let scrollTimeout: ReturnType<typeof setTimeout>;

	function handleScroll(e: Event) {
		scrollTop = (e.target as HTMLElement).scrollTop;
		
		// Track scrolling state for performance optimizations
		isScrolling = true;
		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isScrolling = false;
		}, 150);
	}

	onMount(() => {
		if (browser) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					containerHeight = entry.contentRect.height;
				}
			});

			if (scrollElement) {
				resizeObserver.observe(scrollElement);
			}

			return () => {
				resizeObserver.disconnect();
				clearTimeout(scrollTimeout);
			};
		}
	});
</script>

<div
	bind:this={scrollElement}
	class="virtual-list {className}"
	style:height="{height}px"
	onscroll={handleScroll}
>
	<div
		class="virtual-list-content"
		style:height="{totalHeight}px"
	>
		<div
			class="virtual-list-items"
			style:transform="translateY({offsetY}px)"
		>
			{#each visibleItems as item, index (startIndex + index)}
				<div
					class="virtual-list-item"
					style:height="{itemHeight}px"
					data-index={startIndex + index}
				>
					{@render children?.(item, startIndex + index)}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.virtual-list {
		overflow-y: auto;
		overflow-x: hidden;
		position: relative;
		contain: strict;
		/* Performance optimizations */
		will-change: scroll-position;
		/* Smooth scrolling on iOS */
		-webkit-overflow-scrolling: touch;
	}

	.virtual-list-content {
		position: relative;
		width: 100%;
	}

	.virtual-list-items {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		contain: layout;
	}

	.virtual-list-item {
		position: relative;
		contain: layout;
		overflow: hidden;
	}

	/* Scrollbar styling for webkit browsers */
	.virtual-list::-webkit-scrollbar {
		width: 6px;
	}

	.virtual-list::-webkit-scrollbar-track {
		background: var(--color-gray-100);
		border-radius: 3px;
	}

	.virtual-list::-webkit-scrollbar-thumb {
		background: var(--color-gray-400);
		border-radius: 3px;
	}

	.virtual-list::-webkit-scrollbar-thumb:hover {
		background: var(--color-gray-600);
	}
</style>