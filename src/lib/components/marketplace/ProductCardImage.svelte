<script lang="ts">
	import { Heart } from '@lucide/svelte';

	interface Props {
		images?: string[];
		videoUrl?: string;
		thumbnailUrl?: string;
		title: string;
		price: number;
		variant?: 'grid' | 'feed' | 'compact';
		showVideo?: boolean;
		showHeart?: boolean;
		onDoubleClick?: () => void;
	}

	let {
		images,
		videoUrl,
		thumbnailUrl,
		title,
		price,
		variant = 'grid',
		showVideo = false,
		showHeart = false,
		onDoubleClick,
	}: Props = $props();

	let imageIndex = $state(0);
	let isImageLoaded = $state(false);

	// Get the primary image
	let primaryImage = $derived(thumbnailUrl || images?.[0] || '/placeholder.jpg');

	function handleDoubleClick() {
		onDoubleClick?.();
	}
</script>

{#if variant === 'feed'}
	<!-- Feed Style Image Container -->
	<div
		class="bg-surface-secondary relative aspect-square select-none"
		role="button"
		tabindex="0"
		ondblclick={handleDoubleClick}
		onkeydown={(e) => e.key === 'Enter' && handleDoubleClick()}
	>
		{#if showVideo && videoUrl}
			<video
				src={videoUrl}
				poster={thumbnailUrl}
				controls
				playsinline
				class="h-full w-full object-cover"
			>
				<track kind="captions" />
			</video>
		{:else}
			{#if !isImageLoaded}
				<div class="skeleton-card h-full w-full"></div>
			{/if}
			<img
				src={images?.[imageIndex] || primaryImage}
				alt={title}
				class="h-full w-full object-cover transition-opacity duration-300 {isImageLoaded
					? 'opacity-100'
					: 'opacity-0'}"
				loading="lazy"
				onload={() => (isImageLoaded = true)}
			/>
		{/if}

		<!-- Image Counter -->
		{#if images && images.length > 1}
			<div
				class="text-inverse absolute top-4 right-4 rounded-full bg-[var(--color-primitive-black)]/70 px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
			>
				{imageIndex + 1}/{images.length}
			</div>
		{/if}

		<!-- Price Badge -->
		<div
			class="text-brand absolute bottom-4 left-4 rounded-full bg-[var(--color-surface-primary)]/95 px-3 py-1.5 text-lg font-bold shadow-lg backdrop-blur-sm"
		>
			{price} лв
		</div>

		<!-- Heart Animation Overlay -->
		{#if showHeart}
			<div class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
				<Heart size={80} class="text-danger heart-animation" fill="currentColor" />
			</div>
		{/if}

		<!-- Navigation Dots for Multiple Images -->
		{#if images && images.length > 1}
			<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-1.5">
				{#each images as _, index}
					<button
						class="h-2 w-2 rounded-full transition-all duration-200 {index === imageIndex
							? 'bg-[var(--color-surface-primary)]'
							: 'bg-[var(--color-surface-primary)]/40'}"
						onclick={() => (imageIndex = index)}
						aria-label="View image {index + 1}"
					></button>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- Grid Style Image Container -->
	<div class="bg-surface-secondary relative aspect-square overflow-hidden">
		{#if !isImageLoaded}
			<div class="skeleton-card h-full w-full"></div>
		{/if}
		<img
			src={primaryImage}
			alt={title}
			loading="lazy"
			class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 {isImageLoaded
				? 'opacity-100'
				: 'opacity-0'}"
			onload={() => (isImageLoaded = true)}
		/>

		<!-- Price Badge -->
		<div
			class="absolute bottom-3 left-3 rounded-full bg-[var(--color-surface-primary)]/95 px-3 py-1.5 shadow-lg backdrop-blur-sm"
		>
			<span class="text-brand text-sm font-bold">{price} лв</span>
		</div>

		<!-- Multiple Images Indicator -->
		{#if images && images.length > 1}
			<div
				class="text-inverse absolute top-3 left-3 rounded-full bg-[var(--color-primitive-black)]/70 px-2 py-1 text-xs backdrop-blur-sm"
			>
				<svg viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3">
					<path
						d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
					/>
					<path d="M14.5 12l-2.5 3-1.5-1.5L9 15l3-4 2.5 3.5z" />
				</svg>
			</div>
		{/if}
	</div>
{/if}
