<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { stepSchemas } from '$lib/schemas/listing';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { setLocale } from '$lib/paraglide/runtime.js';
	
	// UI Components
	import Button from '$lib/components/ui/button';
	import MobileStepper from './MobileStepper.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import ProductImageUploader from './ProductImageUploader.svelte';
	import ProductDetailsForm from './ProductDetailsForm.svelte';
	import ShippingOptions from './ShippingOptions.svelte';
	import ListingPreview from './ListingPreview.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		data: {
			form: any;
			user: any;
			session: any;
			lang?: 'bg' | 'en';
		};
	}

	let { data }: Props = $props();
	
	// Set locale if provided
	if (data.lang) {
		setLocale(data.lang);
	}
	
	// Publishing state
	let isPublishing = $state(false);
	
	// Form setup with Superforms
	const { form, errors, enhance, submitting } = superForm(data.form, {
		id: 'listing',
		dataType: 'form',
		resetForm: false,
		delayMs: 0,
		timeoutMs: 10000,
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Successfully created listing - redirect to success page
				isPublishing = true;
				toast.success(m.sell?.success_message?.() ?? 'Listing created successfully!');
				window.location.href = result.location;
			} else if (result.type === 'failure') {
				isPublishing = false;
				toast.error(m.sell?.errors?.failed_to_create?.() ?? 'Failed to create listing. Please try again.');
			}
		},
		onSubmit: () => {
			isPublishing = true;
		}
	});

	// Multi-step form state
	let currentStep = $state(1);
	const totalSteps = 5;
	const stepLabels = [
		m.sell?.category?.() ?? 'Category',
		m.sell?.add_photos?.() ?? 'Photos', 
		m.sell?.details?.() ?? 'Details',
		m.sell?.shipping?.() ?? 'Shipping',
		m.sell?.preview?.() ?? 'Review'
	];

	// Step validation
	async function validateStep(step: number): Promise<boolean> {
		const schema = stepSchemas[step as keyof typeof stepSchemas];
		if (!schema) return true;

		const stepData = getStepData(step);
		
		try {
			// Validate using Zod directly
			const parsed = schema.safeParse(stepData);
			
			if (!parsed.success) {
				// Get all errors for better feedback
				const errors = parsed.error.errors;
				
				// Show specific error messages
				if (step === 1 && !$form.category) {
					toast.error(m.sell?.errors?.select_category?.() ?? 'Please select a category');
				} else if (step === 2 && (!$form.images || $form.images.length === 0)) {
					toast.error(m.sell?.errors?.add_photo?.() ?? 'Please add at least one photo');
				} else if (step === 3) {
					// Check for specific missing fields
					if (!$form.title) {
						toast.error(m.sell?.errors?.add_title?.() ?? 'Please add a title');
					} else if (!$form.description) {
						toast.error(m.sell?.errors?.add_description?.() ?? 'Please add a description');
					} else if (!$form.price || $form.price <= 0) {
						toast.error(m.sell?.errors?.add_price?.() ?? 'Please add a valid price');
					} else if (!$form.size) {
						toast.error(m.sell?.errors?.select_size?.() ?? 'Please select a size');
					} else if (!$form.condition) {
						toast.error(m.sell?.errors?.select_condition?.() ?? 'Please select item condition');
					} else {
						// Show first error if we don't have a specific message
						const firstError = errors[0]?.message;
						if (firstError) {
							toast.error(firstError);
						}
					}
				} else if (step === 4) {
					if (!$form.location) {
						toast.error(m.sell?.errors?.add_location?.() ?? 'Please add your location');
					}
				} else {
					// Generic error for other cases
					const firstError = errors[0]?.message;
					if (firstError) {
						toast.error(firstError);
					}
				}
				
				return false;
			}
			
			return true;
		} catch (e) {
			toast.error(m.sell?.errors?.validation_error?.() ?? 'Validation error. Please check your input.');
			return false;
		}
	}

	function getStepData(step: number) {
		switch (step) {
			case 1:
				return { category: $form.category };
			case 2:
				return { images: $form.images };
			case 3:
				return {
					title: $form.title,
					description: $form.description,
					price: $form.price,
					brand: $form.brand,
					size: $form.size,
					condition: $form.condition,
					color: $form.color,
					material: $form.material
				};
			case 4:
				return {
					location: $form.location,
					shipping_available: $form.shipping_available,
					shipping_price: $form.shipping_price
				};
			default:
				return {};
		}
	}

	// Navigation handlers
	async function handleNext() {
		const isValid = await validateStep(currentStep);
		if (isValid && currentStep < totalSteps) {
			currentStep++;
			// Scroll to top on mobile
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	async function handlePrev() {
		if (currentStep > 1) {
			currentStep--;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	async function handleStepJump(step: number) {
		if (step < currentStep) {
			currentStep = step;
		} else if (step === currentStep + 1) {
			await handleNext();
		}
	}

	// Form field handlers
	function handleCategorySelect(categoryId: string) {
		$form.category = categoryId;
	}

	function handleImagesChange(images: string[]) {
		$form.images = images;
	}

	function handleFieldChange(field: string, value: any) {
		($form as any)[field] = value;
	}

	// Check if we can proceed to the next step
	let canProceed = $derived(
		currentStep === 1 ? !!$form.category :
		currentStep === 2 ? ($form.images?.length || 0) > 0 :
		currentStep === 3 ? !!$form.title && $form.price > 0 :
		true
	);
</script>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-2xl px-4 py-6">
		<!-- Mobile-optimized header -->
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-xl font-semibold">{m.sell?.title?.() ?? 'Create Listing'}</h1>
			<button
				type="button"
				onclick={() => goto('/')}
				class="text-gray-600 hover:text-gray-900"
			>
				{m.common?.cancel?.() ?? 'Cancel'}
			</button>
		</div>

		<!-- Mobile stepper -->
		<MobileStepper 
			{currentStep} 
			{totalSteps}
			labels={stepLabels}
		/>

		<!-- Form -->
		<form method="POST" use:enhance class="bg-white rounded-lg shadow-sm p-4 md:p-6">
			<!-- Hidden inputs for form data -->
			<input type="hidden" name="category" value={$form.category} />
			{#each $form.images || [] as image}
				<input type="hidden" name="images" value={image} />
			{/each}
			<input type="hidden" name="title" value={$form.title} />
			<input type="hidden" name="description" value={$form.description} />
			<input type="hidden" name="price" value={$form.price} />
			<input type="hidden" name="brand" value={$form.brand} />
			<input type="hidden" name="size" value={$form.size} />
			<input type="hidden" name="condition" value={$form.condition} />
			<input type="hidden" name="color" value={$form.color} />
			<input type="hidden" name="material" value={$form.material} />
			<input type="hidden" name="location" value={$form.location} />
			<input type="hidden" name="shipping_available" value={$form.shipping_available} />
			<input type="hidden" name="shipping_price" value={$form.shipping_price} />
			<!-- Step 1: Category Selection -->
			{#if currentStep === 1}
				<CategorySelector
					selectedCategory={$form.category}
					onCategorySelect={handleCategorySelect}
				/>
			{/if}

			<!-- Step 2: Images -->
			{#if currentStep === 2}
				<ProductImageUploader
					images={$form.images || []}
					userId={data.user?.id || ''}
					onImagesChange={handleImagesChange}
				/>
			{/if}

			<!-- Step 3: Product Details -->
			{#if currentStep === 3}
				<ProductDetailsForm
					title={$form.title}
					description={$form.description}
					price={$form.price}
					brand={$form.brand}
					size={$form.size}
					condition={$form.condition}
					color={$form.color}
					material={$form.material}
					selectedCategory={$form.category}
					showCustomBrand={false}
					customBrand=""
					onFieldChange={handleFieldChange}
					onCustomBrandToggle={() => {}}
				/>
			{/if}

			<!-- Step 4: Shipping -->
			{#if currentStep === 4}
				<ShippingOptions
					location={$form.location}
					shippingAvailable={$form.shipping_available}
					shippingPrice={$form.shipping_price}
					tags={$form.tags || []}
					onLocationChange={(val) => handleFieldChange('location', val)}
					onShippingToggle={(val) => handleFieldChange('shipping_available', val)}
					onShippingPriceChange={(val) => handleFieldChange('shipping_price', val)}
					onTagAdd={(tag) => {
						const currentTags = $form.tags || [];
						if (!currentTags.includes(tag)) {
							handleFieldChange('tags', [...currentTags, tag]);
						}
					}}
					onTagRemove={(tag) => {
						const currentTags = $form.tags || [];
						handleFieldChange('tags', currentTags.filter((t: string) => t !== tag));
					}}
				/>
			{/if}

			<!-- Step 5: Preview -->
			{#if currentStep === 5}
				<ListingPreview
					listing={{
						title: $form.title || '',
						description: $form.description || '',
						price: Number($form.price) || 0,
						brand: $form.brand || '',
						size: $form.size || '',
						condition: $form.condition || 'like_new',
						color: $form.color || '',
						material: $form.material || '',
						location: $form.location || 'Sofia, Bulgaria',
						shipping_available: Boolean($form.shipping_available),
						shipping_price: Number($form.shipping_price) || 0,
						tags: $form.tags || [],
						images: $form.images || []
					}}
					selectedCategory={$form.category || ''}
				/>
			{/if}

			<!-- Navigation buttons -->
			<div class="mt-6 flex gap-3 border-t pt-4">
				{#if currentStep > 1}
					<Button
						type="button"
						variant="outline"
						onclick={handlePrev}
						class="flex-1"
					>
						{m.common?.back?.() ?? 'Back'}
					</Button>
				{/if}

				{#if currentStep < totalSteps}
					<Button
						type="button"
						onclick={handleNext}
						disabled={!canProceed}
						class="flex-1"
					>
						{m.common?.next?.() ?? 'Next'}
					</Button>
				{:else}
					<Button
						type="submit"
						disabled={$submitting || isPublishing}
						class="flex-1"
					>
						{$submitting || isPublishing ? (m.sell?.publishing?.() ?? 'Publishing...') : (m.sell?.publish?.() ?? 'Publish Listing')}
					</Button>
				{/if}
			</div>
		</form>
	</div>
</div>