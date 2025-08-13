<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { stepSchemas } from '$lib/schemas/listing';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	// UI Components
	import Button from '$lib/components/ui/button';
	import MobileStepper from './MobileStepper.svelte';
	import CategorySelector from './CategorySelector.svelte';
	import ImageUpload from './ImageUpload.svelte';
	import ProductDetailsForm from './ProductDetailsForm.svelte';
	import ShippingOptions from './ShippingOptions.svelte';
	import ListingPreview from './ListingPreview.svelte';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		data: {
			form: any;
			user: any;
			session: any;
		};
	}

	let { data }: Props = $props();
	
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
				toast.success(m['sell.success_message']());
				window.location.href = result.location;
			} else if (result.type === 'failure') {
				isPublishing = false;
				toast.error(m['sell.errors.failed_to_create']());
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
		m['sell.category'](),
		m['sell.add_photos'](), 
		m['sell.details'](),
		m['sell.shipping'](),
		m['sell.preview']()
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
					toast.error(m['sell.errors.select_category']());
				} else if (step === 2 && (!$form.images || $form.images.length === 0)) {
					toast.error(m['sell.errors.add_photo']());
				} else if (step === 3) {
					// Check for specific missing fields
					if (!$form.title) {
						toast.error(m['sell.errors.add_title']());
					} else if (!$form.description) {
						toast.error(m['sell.errors.add_description']());
					} else if (!$form.price || $form.price <= 0) {
						toast.error(m['sell.errors.add_price']());
					} else if (!$form.size) {
						toast.error(m['sell.errors.select_size']());
					} else if (!$form.condition) {
						toast.error(m['sell.errors.select_condition']());
					} else {
						// Show first error if we don't have a specific message
						const firstError = errors[0]?.message;
						if (firstError) {
							toast.error(firstError);
						}
					}
				} else if (step === 4) {
					if (!$form.location) {
						toast.error(m['sell.errors.add_location']());
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
			toast.error(m['sell.errors.validation_error']());
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

<div class="sell-container">
	<div class="sell-wrapper">
		<!-- Mobile-optimized header -->
		<div class="sell-header">
			<h1 class="sell-title">{m['sell.title']()}</h1>
			<button
				type="button"
				onclick={() => goto('/')}
				class="cancel-button"
			>
				{m['common.cancel']()}
			</button>
		</div>

		<!-- Mobile stepper -->
		<MobileStepper 
			{currentStep} 
			{totalSteps}
			labels={stepLabels}
		/>

		<!-- Form -->
		<form method="POST" use:enhance class="sell-form">
			<!-- Scrollable form content -->
			<div class="form-content">
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
				<ImageUpload
					maxImages={10}
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
			</div>

			<!-- Navigation buttons (sticky at bottom) -->
			<div class="navigation-buttons">
				{#if currentStep > 1}
					<button
						type="button"
						onclick={handlePrev}
						class="nav-button secondary"
					>
						{m['common.back']()}
					</button>
				{/if}

				{#if currentStep < totalSteps}
					<button
						type="button"
						onclick={handleNext}
						disabled={!canProceed}
						class="nav-button primary"
					>
						{m['common.next']()}
					</button>
				{:else}
					<button
						type="submit"
						disabled={$submitting || isPublishing}
						class="nav-button primary publish"
					>
						{$submitting || isPublishing ? m['sell.publishing']() : m['sell.publish']()}
					</button>
				{/if}
			</div>
		</form>
	</div>
</div>

<style>
	.sell-container {
		min-height: 100vh;
		background: var(--color-surface-secondary);
		padding-top: var(--header-height);
		padding-bottom: env(safe-area-inset-bottom, 20px);
	}

	.sell-wrapper {
		max-width: 680px;
		margin: 0 auto;
		padding: var(--space-5) var(--space-4);
	}

	.sell-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
		padding: 0 var(--space-1);
	}

	.sell-title {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
		font-family: var(--font-family-sans);
		letter-spacing: -0.02em;
	}

	.cancel-button {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
		font-family: var(--font-family-sans);
		cursor: pointer;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--border-radius-md);
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		-webkit-tap-highlight-color: transparent;
	}

	.cancel-button:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-tertiary);
	}

	.cancel-button:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
		color: var(--color-text-primary);
	}

	.cancel-button:active {
		transform: scale(0.98);
	}

	.sell-form {
		background: var(--color-surface-primary);
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-md);
		padding: var(--space-6);
		border: 2px solid var(--color-border-primary);
		font-family: var(--font-family-sans);
	}

	/* Global form typography */
	.sell-form :global(*) {
		font-family: var(--font-family-sans);
	}

	.sell-form :global(input),
	.sell-form :global(textarea),
	.sell-form :global(select) {
		font-size: var(--font-size-base);
		line-height: 1.5;
	}

	.sell-form :global(label) {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--space-1-5);
		display: block;
	}

	.sell-form :global(h2),
	.sell-form :global(h3) {
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.sell-form :global(p) {
		font-size: var(--font-size-sm);
		line-height: 1.5;
		color: var(--color-text-secondary);
	}

	.navigation-buttons {
		display: flex;
		gap: var(--space-3);
		margin-top: var(--space-6);
		padding-top: var(--space-5);
		border-top: 2px solid var(--color-border-primary);
	}

	.nav-button {
		flex: 1;
		height: 48px;
		border-radius: var(--border-radius-lg);
		font-size: var(--font-size-base);
		font-weight: 500;
		font-family: var(--font-family-sans);
		line-height: 1;
		letter-spacing: -0.01em;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-xs);
	}

	.nav-button.primary {
		background: var(--color-interactive-primary);
		color: white;
	}

	.nav-button.primary:hover:not(:disabled) {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}

	.nav-button.primary:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3), 0 4px 12px rgba(37, 99, 235, 0.2);
	}

	.nav-button.primary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
	}

	.nav-button.secondary {
		background: var(--color-surface-primary);
		color: var(--color-text-primary);
		border: 2px solid var(--color-border-primary);
	}

	.nav-button.secondary:hover {
		background: var(--color-surface-secondary);
		border-color: var(--color-border-secondary);
	}

	.nav-button.secondary:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
		border-color: var(--color-interactive-primary);
	}

	.nav-button.secondary:active {
		transform: scale(0.98);
		background: var(--color-surface-tertiary);
	}

	.nav-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.nav-button.publish {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.nav-button.publish:hover:not(:disabled) {
		background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.nav-button.publish:focus-visible {
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.4), 0 6px 20px rgba(102, 126, 234, 0.3);
	}

	.nav-button.publish:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.sell-wrapper {
			padding: var(--space-4) var(--space-3);
		}

		.sell-form {
			padding: var(--space-5) var(--space-4);
			border-radius: var(--border-radius-lg);
		}

		.sell-title {
			font-size: var(--font-size-xl);
		}

		.nav-button {
			height: 44px;
			font-size: var(--font-size-sm);
		}

		.navigation-buttons {
			gap: var(--space-2);
		}
	}

	/* Desktop adjustments */
	@media (min-width: 768px) {
		.sell-container {
			padding-top: var(--header-height-md);
		}

		.sell-wrapper {
			padding: var(--space-8) var(--space-6);
		}

		.sell-form {
			padding: var(--space-8);
		}

		.sell-header {
			margin-bottom: var(--space-6);
		}

		.nav-button {
			height: 48px;
			font-size: var(--font-size-base);
		}
	}
</style>