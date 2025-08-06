<script lang="ts">
	import { CATEGORIES, CONDITIONS } from '$lib/data/categories';
	import type { ListingPreviewProps } from './types';

	let { listing, selectedCategory }: ListingPreviewProps = $props();

	let category = $derived(CATEGORIES.find((c) => c.id === selectedCategory));
	let conditionInfo = $derived(CONDITIONS.find((c) => c.id === listing.condition));
</script>

<div class="mb-8">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">Preview Your Listing</h2>
		<p class="text-gray-600">This is how your listing will appear to buyers</p>
	</div>

	<div
		class="mx-auto max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
	>
		<!-- Images -->
		{#if listing.images && listing.images.length > 0}
			<div class="aspect-square bg-gray-100">
				<img src={listing.images[0]} alt={listing.title} class="h-full w-full object-cover" />
				{#if listing.images.length > 1}
					<div class="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
						+{listing.images.length - 1}
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex aspect-square items-center justify-center bg-gray-100">
				<div class="text-center text-gray-400">
					<div class="mb-2 text-4xl">📷</div>
					<p class="text-sm">No photos added</p>
				</div>
			</div>
		{/if}

		<!-- Content -->
		<div class="p-4">
			<!-- Title and Price -->
			<div class="mb-3">
				<h3 class="line-clamp-2 text-lg font-semibold text-gray-900">
					{listing.title || 'Untitled Item'}
				</h3>
				<p class="mt-1 text-2xl font-bold text-gray-900">
					{listing.price ? `${listing.price} BGN` : '0 BGN'}
				</p>
			</div>

			<!-- Details -->
			<div class="space-y-2 text-sm text-gray-600">
				{#if category}
					<div class="flex items-center gap-2">
						<span>{category.emoji}</span>
						<span>{category.name}</span>
					</div>
				{/if}

				{#if conditionInfo}
					<div class="flex items-center gap-2">
						<span>{conditionInfo.emoji}</span>
						<span>{conditionInfo.name}</span>
					</div>
				{/if}

				{#if listing.brand}
					<div class="flex items-center gap-2">
						<span>🏷️</span>
						<span>{listing.brand}</span>
					</div>
				{/if}

				{#if listing.size}
					<div class="flex items-center gap-2">
						<span>📏</span>
						<span>Size {listing.size}</span>
					</div>
				{/if}

				{#if listing.location}
					<div class="flex items-center gap-2">
						<span>📍</span>
						<span>{listing.location}</span>
					</div>
				{/if}

				{#if listing.shipping_available}
					<div class="flex items-center gap-2">
						<span>🚚</span>
						<span
							>Shipping available {listing.shipping_price
								? `(${listing.shipping_price} BGN)`
								: ''}</span
						>
					</div>
				{/if}
			</div>

			<!-- Description -->
			{#if listing.description}
				<div class="mt-3 border-t border-gray-100 pt-3">
					<p class="line-clamp-3 text-sm text-gray-700">{listing.description}</p>
				</div>
			{/if}

			<!-- Tags -->
			{#if listing.tags && listing.tags.length > 0}
				<div class="mt-3 border-t border-gray-100 pt-3">
					<div class="flex flex-wrap gap-1">
						{#each listing.tags.slice(0, 3) as tag}
							<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">#{tag}</span>
						{/each}
						{#if listing.tags.length > 3}
							<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500"
								>+{listing.tags.length - 3}</span
							>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
