<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createListing, type ListingData } from '$lib/services/listingService';
	import type { SellFormProps, SellFormData } from './types';

	// Components
	import StepIndicator from './StepIndicator.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import ProductImageUploader from './ProductImageUploader.svelte';
	import ProductDetailsForm from './ProductDetailsForm.svelte';
	import ShippingOptions from './ShippingOptions.svelte';
	import ListingPreview from './ListingPreview.svelte';
	import FormNavigation from './FormNavigation.svelte';

	let { userId }: SellFormProps = $props();

	// Form state
	let loading = $state(false);
	let currentStep = $state(1);
	let selectedCategory = $state('');
	let customBrand = $state('');
	let showCustomBrand = $state(false);

	// Form data
	let listing = $state<SellFormData>({
		title: '',
		description: '',
		price: 0,
		brand: '',
		size: '',
		condition: 'like_new',
		color: '',
		material: '',
		location: 'Sofia, Bulgaria',
		shipping_available: true,
		shipping_price: 5,
		tags: [],
		images: [],
	});

	const totalSteps = 5;

	// Validation
	function validateCurrentStep(): boolean {
		switch (currentStep) {
			case 1: // Category
				if (!selectedCategory) {
					alert('Please select a category');
					return false;
				}
				return true;
			case 2: // Images
				if (listing.images.length === 0) {
					alert('Please add at least one photo');
					return false;
				}
				return true;
			case 3: // Basic info
				if (!listing.title?.trim()) {
					alert('Please enter a title');
					return false;
				}
				if (!listing.price || listing.price <= 0) {
					alert('Please enter a valid price');
					return false;
				}
				return true;
			case 4: // Shipping
				return true;
			case 5: // Preview
				return true;
			default:
				return true;
		}
	}

	// Navigation
	function handleNext() {
		if (validateCurrentStep()) {
			currentStep++;
		}
	}

	function handlePrev() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	// Form handlers
	function handleCategorySelect(categoryId: string) {
		selectedCategory = categoryId;
	}

	function handleImagesChange(images: string[]) {
		listing.images = images;
	}

	function handleFieldChange(field: string, value: any) {
		(listing as any)[field] = value;
	}

	function handleCustomBrandToggle(show: boolean) {
		showCustomBrand = show;
	}

	function handleLocationChange(location: string) {
		listing.location = location;
	}

	function handleShippingToggle(available: boolean) {
		listing.shipping_available = available;
	}

	function handleShippingPriceChange(price: number) {
		listing.shipping_price = price;
	}

	function handleTagAdd(tag: string) {
		if (!listing.tags) listing.tags = [];
		if (!listing.tags.includes(tag) && listing.tags.length < 10) {
			listing.tags = [...listing.tags, tag];
		}
	}

	function handleTagRemove(tag: string) {
		if (listing.tags) {
			listing.tags = listing.tags.filter((t) => t !== tag);
		}
	}

	// Publishing
	async function handlePublish() {
		if (!validateCurrentStep()) return;

		loading = true;

		try {
			const finalBrand = showCustomBrand ? customBrand : listing.brand;

			const listingData: ListingData = {
				title: listing.title!,
				description: listing.description || '',
				price: listing.price!,
				brand: finalBrand,
				size: listing.size,
				condition: listing.condition!,
				color: listing.color,
				material: listing.material,
				images: listing.images,
				location: listing.location,
				shipping_available: listing.shipping_available!,
				shipping_price: listing.shipping_available ? listing.shipping_price : undefined,
				tags: listing.tags || [],
			};

			const supabase = $page.data.supabase;
			if (!supabase) {
				throw new Error('Supabase client not available');
			}
			const result = await createListing(listingData, supabase);

			// Success! Redirect to the new listing
			goto(`/products/${result.id}`);
		} catch (error) {
			console.error('Error creating listing:', error);
			alert('Failed to create listing. Please try again.');
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 px-4 py-4 md:py-8">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6 text-center">
			<h1 class="mb-4 text-2xl md:text-3xl font-semibold text-gray-900">Create Listing</h1>
			<StepIndicator {currentStep} {totalSteps} />
		</div>

		<div class="rounded-xl bg-white p-4 md:p-8 shadow-sm">
			<!-- Step 1: Category Selection -->
			{#if currentStep === 1}
				<CategorySelector {selectedCategory} onCategorySelect={handleCategorySelect} />
			{/if}

			<!-- Step 2: Images -->
			{#if currentStep === 2}
				<div class="mb-8 text-center">
					<h2 class="mb-2 text-2xl font-semibold text-gray-900">Add Photos</h2>
					<p class="text-gray-600">Great photos help your item sell faster</p>
				</div>

				<ProductImageUploader
					images={listing.images}
					{userId}
					onImagesChange={handleImagesChange}
				/>
			{/if}

			<!-- Step 3: Product Details -->
			{#if currentStep === 3}
				<ProductDetailsForm
					title={listing.title}
					description={listing.description}
					price={listing.price}
					brand={listing.brand}
					size={listing.size}
					condition={listing.condition}
					color={listing.color}
					material={listing.material}
					{selectedCategory}
					{showCustomBrand}
					{customBrand}
					onFieldChange={handleFieldChange}
					onCustomBrandToggle={handleCustomBrandToggle}
				/>
			{/if}

			<!-- Step 4: Shipping Options -->
			{#if currentStep === 4}
				<ShippingOptions
					location={listing.location}
					shippingAvailable={listing.shipping_available}
					shippingPrice={listing.shipping_price}
					tags={listing.tags}
					onLocationChange={handleLocationChange}
					onShippingToggle={handleShippingToggle}
					onShippingPriceChange={handleShippingPriceChange}
					onTagAdd={handleTagAdd}
					onTagRemove={handleTagRemove}
				/>
			{/if}

			<!-- Step 5: Preview -->
			{#if currentStep === 5}
				<ListingPreview {listing} {selectedCategory} />
			{/if}

			<!-- Navigation -->
			<FormNavigation
				{currentStep}
				{totalSteps}
				{loading}
				onNext={handleNext}
				onPrev={handlePrev}
				onPublish={handlePublish}
			/>
		</div>
	</div>
</div>
