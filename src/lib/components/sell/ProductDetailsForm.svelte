<script lang="ts">
	import { CONDITIONS, SIZES, BRANDS } from '$lib/data/categories';
	import type { ProductDetailsFormProps } from './types';

	let {
		title,
		description,
		price,
		brand,
		size,
		condition,
		color,
		material,
		selectedCategory,
		showCustomBrand,
		customBrand,
		onFieldChange,
		onCustomBrandToggle,
	}: ProductDetailsFormProps = $props();

	function getSizesForCategory() {
		if (selectedCategory.includes('shoes')) return SIZES.shoes;
		if (selectedCategory.includes('clothing')) return SIZES.clothing;
		return SIZES.accessories;
	}
</script>

<div class="mb-8">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">Item Details</h2>
		<p class="text-gray-600">Tell buyers about your item</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Title -->
		<div class="md:col-span-2">
			<label for="title" class="mb-2 block font-medium text-gray-900">Title *</label>
			<input
				id="title"
				type="text"
				value={title}
				oninput={(e) => onFieldChange('title', (e.target as HTMLInputElement).value)}
				placeholder="e.g. Vintage Denim Jacket"
				maxlength="100"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				required
			/>
			<span class="mt-1 block text-right text-sm text-gray-500">{title?.length || 0}/100</span>
		</div>

		<!-- Description -->
		<div class="md:col-span-2">
			<label for="description" class="mb-2 block font-medium text-gray-900">Description</label>
			<textarea
				id="description"
				value={description}
				oninput={(e) => onFieldChange('description', (e.target as HTMLTextAreaElement).value)}
				placeholder="Describe the item's condition, fit, and any flaws..."
				maxlength="500"
				rows="4"
				class="resize-vertical min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			></textarea>
			<span class="mt-1 block text-right text-sm text-gray-500">{description?.length || 0}/500</span
			>
		</div>

		<!-- Price -->
		<div>
			<label for="price" class="mb-2 block font-medium text-gray-900">Price (BGN) *</label>
			<input
				id="price"
				type="number"
				value={price}
				oninput={(e) =>
					onFieldChange('price', parseFloat((e.target as HTMLInputElement).value) || 0)}
				placeholder="0"
				min="0"
				step="0.01"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				required
			/>
		</div>

		<!-- Condition -->
		<div>
			<label for="condition" class="mb-2 block font-medium text-gray-900">Condition *</label>
			<select
				id="condition"
				value={condition}
				onchange={(e) => onFieldChange('condition', (e.target as HTMLSelectElement).value)}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			>
				{#each CONDITIONS as conditionOption}
					<option value={conditionOption.id}>
						{conditionOption.emoji}
						{conditionOption.name}
					</option>
				{/each}
			</select>
		</div>

		<!-- Brand -->
		<div>
			<label for="brand" class="mb-2 block font-medium text-gray-900">Brand</label>
			{#if !showCustomBrand}
				<select
					id="brand"
					value={brand}
					onchange={(e) => onFieldChange('brand', (e.target as HTMLSelectElement).value)}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				>
					<option value="">Select brand</option>
					{#each BRANDS as brandOption}
						<option value={brandOption}>{brandOption}</option>
					{/each}
				</select>
				{#if brand === 'Other'}
					<button
						type="button"
						onclick={() => onCustomBrandToggle(true)}
						class="mt-2 cursor-pointer text-sm text-blue-600 underline"
					>
						Enter custom brand
					</button>
				{/if}
			{:else}
				<input
					type="text"
					value={customBrand}
					oninput={(e) => onFieldChange('customBrand', (e.target as HTMLInputElement).value)}
					placeholder="Enter brand name"
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				/>
				<button
					type="button"
					onclick={() => onCustomBrandToggle(false)}
					class="mt-2 cursor-pointer text-sm text-blue-600 underline"
				>
					Choose from list
				</button>
			{/if}
		</div>

		<!-- Size -->
		<div>
			<label for="size" class="mb-2 block font-medium text-gray-900">Size</label>
			<select
				id="size"
				value={size}
				onchange={(e) => onFieldChange('size', (e.target as HTMLSelectElement).value)}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			>
				<option value="">Select size</option>
				{#each getSizesForCategory() as sizeOption}
					<option value={sizeOption}>{sizeOption}</option>
				{/each}
			</select>
		</div>

		<!-- Color -->
		<div>
			<label for="color" class="mb-2 block font-medium text-gray-900">Color</label>
			<input
				id="color"
				type="text"
				value={color}
				oninput={(e) => onFieldChange('color', (e.target as HTMLInputElement).value)}
				placeholder="e.g. Blue, Black, Multi"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			/>
		</div>

		<!-- Material -->
		<div>
			<label for="material" class="mb-2 block font-medium text-gray-900">Material</label>
			<input
				id="material"
				type="text"
				value={material}
				oninput={(e) => onFieldChange('material', (e.target as HTMLInputElement).value)}
				placeholder="e.g. 100% Cotton, Polyester"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			/>
		</div>
	</div>
</div>
