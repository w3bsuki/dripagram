<script lang="ts">
	import { CONDITIONS, SIZES, BRANDS } from '$lib/data/categories';
	import type { ProductDetailsFormProps } from './types';
	import * as m from '$lib/paraglide/messages';

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

	// Get translated condition name
	function getConditionName(conditionId: string) {
		return m[`conditions.${conditionId}`]?.() || conditionId;
	}
</script>

<div class="mb-8">
	<div class="mb-8 text-center">
		<h2 class="mb-2 text-2xl font-semibold text-gray-900">{m['sell.item_details']()}</h2>
		<p class="text-gray-600">{m['sell.tell_buyers']()}</p>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Title -->
		<div class="md:col-span-2">
			<label for="title" class="mb-2 block font-medium text-gray-900">{m['sell.title_label']()} *</label>
			<input
				id="title"
				type="text"
				value={title}
				oninput={(e) => onFieldChange('title', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.title_placeholder_details']()}
				maxlength="100"
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				required
			/>
			<span class="mt-1 block text-right text-sm text-gray-500">{title?.length || 0}/100</span>
		</div>

		<!-- Description -->
		<div class="md:col-span-2">
			<label for="description" class="mb-2 block font-medium text-gray-900">{m['sell.description_label']()}</label>
			<textarea
				id="description"
				value={description}
				oninput={(e) => onFieldChange('description', (e.target as HTMLTextAreaElement).value)}
				placeholder={m['sell.description_placeholder_details']()}
				maxlength="500"
				rows="4"
				class="resize-vertical min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			></textarea>
			<span class="mt-1 block text-right text-sm text-gray-500">{description?.length || 0}/500</span
			>
		</div>

		<!-- Price -->
		<div>
			<label for="price" class="mb-2 block font-medium text-gray-900">{m['sell.price_bgn']()}</label>
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
			<label for="condition" class="mb-2 block font-medium text-gray-900">{m['sell.condition_label']()} *</label>
			<select
				id="condition"
				value={condition}
				onchange={(e) => onFieldChange('condition', (e.target as HTMLSelectElement).value)}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			>
				{#each CONDITIONS as conditionOption}
					<option value={conditionOption.id}>
						{conditionOption.emoji}
						{getConditionName(conditionOption.id)}
					</option>
				{/each}
			</select>
		</div>

		<!-- Brand -->
		<div>
			<label for="brand" class="mb-2 block font-medium text-gray-900">{m['sell.brand_label']()}</label>
			{#if !showCustomBrand}
				<select
					id="brand"
					value={brand}
					onchange={(e) => onFieldChange('brand', (e.target as HTMLSelectElement).value)}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				>
					<option value="">{m['sell.select_brand']()}</option>
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
						{m['sell.enter_custom_brand']()}
					</button>
				{/if}
			{:else}
				<input
					type="text"
					value={customBrand}
					oninput={(e) => onFieldChange('customBrand', (e.target as HTMLInputElement).value)}
					placeholder={m['sell.enter_brand_name']()}
					class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
				/>
				<button
					type="button"
					onclick={() => onCustomBrandToggle(false)}
					class="mt-2 cursor-pointer text-sm text-blue-600 underline"
				>
					{m['sell.choose_from_list']()}
				</button>
			{/if}
		</div>

		<!-- Size -->
		<div>
			<label for="size" class="mb-2 block font-medium text-gray-900">{m['sell.size_label']()}</label>
			<select
				id="size"
				value={size}
				onchange={(e) => onFieldChange('size', (e.target as HTMLSelectElement).value)}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			>
				<option value="">{m['sell.select_size']()}</option>
				{#each getSizesForCategory() as sizeOption}
					<option value={sizeOption}>{sizeOption}</option>
				{/each}
			</select>
		</div>

		<!-- Color -->
		<div>
			<label for="color" class="mb-2 block font-medium text-gray-900">{m['sell.color_label']()}</label>
			<input
				id="color"
				type="text"
				value={color}
				oninput={(e) => onFieldChange('color', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.color_placeholder']()}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			/>
		</div>

		<!-- Material -->
		<div>
			<label for="material" class="mb-2 block font-medium text-gray-900">{m['sell.material_label']()}</label>
			<input
				id="material"
				type="text"
				value={material}
				oninput={(e) => onFieldChange('material', (e.target as HTMLInputElement).value)}
				placeholder={m['sell.material_placeholder']()}
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-600 focus:outline-none"
			/>
		</div>
	</div>
</div>
