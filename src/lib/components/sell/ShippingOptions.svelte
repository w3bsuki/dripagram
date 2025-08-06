<script lang="ts">
	import type { ShippingOptionsProps } from './types';

	let {
		location,
		shippingAvailable,
		shippingPrice,
		tags,
		onLocationChange,
		onShippingToggle,
		onShippingPriceChange,
		onTagAdd,
		onTagRemove,
	}: ShippingOptionsProps = $props();

	let tagInput = $state('');

	function handleTagKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			const value = tagInput.trim();
			if (value) {
				onTagAdd(value);
				tagInput = '';
			}
		}
	}
</script>

<div class="mb-8">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">Shipping & Location</h2>
		<p class="text-gray-600">Let buyers know how they can get the item</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Location -->
		<div class="md:col-span-2">
			<label for="location" class="mb-2 block font-medium text-gray-900">Location</label>
			<input
				id="location"
				type="text"
				value={location}
				oninput={(e) => onLocationChange((e.target as HTMLInputElement).value)}
				placeholder="Sofia, Bulgaria"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			/>
		</div>

		<!-- Shipping Available -->
		<div class="md:col-span-2">
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="checkbox"
					checked={shippingAvailable}
					onchange={(e) => onShippingToggle((e.target as HTMLInputElement).checked)}
					class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class="font-medium text-gray-900">Offer shipping</span>
			</label>
		</div>

		<!-- Shipping Price -->
		{#if shippingAvailable}
			<div>
				<label for="shipping_price" class="mb-2 block font-medium text-gray-900"
					>Shipping Cost (BGN)</label
				>
				<input
					id="shipping_price"
					type="number"
					value={shippingPrice}
					oninput={(e) =>
						onShippingPriceChange(parseFloat((e.target as HTMLInputElement).value) || 0)}
					placeholder="5"
					min="0"
					step="0.01"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				/>
			</div>
		{/if}

		<!-- Tags -->
		<div class="md:col-span-2">
			<label for="tags" class="mb-2 block font-medium text-gray-900">Tags (optional)</label>
			<div class="space-y-4">
				<input
					id="tags"
					type="text"
					bind:value={tagInput}
					placeholder="Add tags (press Enter)"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
					onkeydown={handleTagKeydown}
				/>
				{#if tags && tags.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each tags as tag}
							<span
								class="flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-sm text-white"
							>
								{tag}
								<button
									type="button"
									onclick={() => onTagRemove(tag)}
									class="text-lg leading-none text-white hover:text-gray-300"
								>
									×
								</button>
							</span>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
