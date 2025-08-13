<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ImageUpload from '$lib/components/sell/ImageUpload.svelte';
	import { ChevronLeft, Package, DollarSign, MapPin, Truck } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Form state
	let loading = $state(false);
	let imageUrls = $state<string[]>([]);

	// Categories - matching database structure
	const categories = [
		{ value: 'shoes', label: 'Women - Shoes' },
		{ value: 'tops', label: 'Women - Tops' },
		{ value: 'bottoms', label: 'Women - Bottoms' },
		{ value: 'dresses', label: 'Women - Dresses' },
		{ value: 'men-shoes', label: 'Men - Shoes' },
		{ value: 'men-tops', label: 'Men - Tops' },
		{ value: 'men-bottoms', label: 'Men - Bottoms' },
		{ value: 'bags', label: 'Accessories - Bags' },
		{ value: 'hats', label: 'Accessories - Hats' },
		{ value: 'jewelry', label: 'Accessories - Jewelry' }
	];

	// Conditions
	const conditions = [
		{ value: 'new', label: 'New with tags' },
		{ value: 'like_new', label: 'Like new' },
		{ value: 'very_good', label: 'Very good' },
		{ value: 'good', label: 'Good' },
		{ value: 'acceptable', label: 'Acceptable' }
	];

	// Common brands
	const popularBrands = [
		'Nike', 'Adidas', 'Zara', 'H&M', 'Mango', 
		'Uniqlo', 'Gap', "Levi's", 'Puma', 'Reserved'
	];

	// Common sizes
	const commonSizes = [
		'XS', 'S', 'M', 'L', 'XL', 'XXL',
		'36', '37', '38', '39', '40', '41', '42', '43', '44'
	];

	// Common colors
	const commonColors = [
		'Black', 'White', 'Gray', 'Navy', 'Brown',
		'Beige', 'Red', 'Blue', 'Green', 'Pink'
	];

	function handleImagesChange(urls: string[]) {
		imageUrls = urls;
	}
</script>

<svelte:head>
	<title>Sell Your Item - Driplo</title>
	<meta name="description" content="List your item for sale on Driplo marketplace" />
</svelte:head>

<div class="container">
	<!-- Header -->
	<header class="header">
		<button 
			type="button"
			onclick={() => history.back()} 
			class="back-btn"
			aria-label="Go back"
		>
			<ChevronLeft size={20} />
		</button>
		<h1>List Your Item</h1>
	</header>

	<!-- Form -->
	<form 
		method="POST"
		use:enhance={({ formData }) => {
			// Add image URLs to form data
			imageUrls.forEach(url => {
				formData.append('images', url);
			});

			// Validate images
			if (imageUrls.length === 0) {
				toast.error('Please add at least one photo');
				return { cancel: true };
			}

			loading = true;

			return async ({ result, update }) => {
				loading = false;

				if (result.type === 'redirect') {
					toast.success('Listing created successfully!');
					goto(result.location);
				} else if (result.type === 'failure') {
					await update();
				}
			};
		}}
		class="form"
	>
		{#if form?.error}
			<div class="error-banner" role="alert">
				{form.error}
			</div>
		{/if}

		<!-- Images Section -->
		<section class="form-section">
			<h2>
				<Package size={20} />
				Photos
			</h2>
			<p class="section-hint">Add up to 10 photos. First photo will be the main image.</p>
			
			<ImageUpload 
				maxImages={10}
				onImagesChange={handleImagesChange}
			/>
		</section>

		<!-- Basic Info Section -->
		<section class="form-section">
			<h2>Basic Information</h2>
			
			<div class="form-group">
				<label for="title">
					Title <span class="required">*</span>
				</label>
				<input
					type="text"
					id="title"
					name="title"
					required
					maxlength="80"
					placeholder="e.g., Blue Nike Sneakers Size 42"
					value={form?.values?.title || ''}
				/>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="price">
						<DollarSign size={16} />
						Price (BGN) <span class="required">*</span>
					</label>
					<input
						type="number"
						id="price"
						name="price"
						required
						min="0.01"
						step="0.01"
						placeholder="0.00"
						value={form?.values?.price || ''}
					/>
				</div>

				<div class="form-group">
					<label for="category">
						Category <span class="required">*</span>
					</label>
					<select
						id="category"
						name="category"
						required
						value={form?.values?.category || ''}
					>
						<option value="">Select category</option>
						{#each categories as cat}
							<option value={cat.value}>{cat.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-group">
				<label for="description">
					Description
				</label>
				<textarea
					id="description"
					name="description"
					rows="4"
					maxlength="1000"
					placeholder="Describe your item, including any flaws or special features..."
					value={form?.values?.description || ''}
				></textarea>
			</div>
		</section>

		<!-- Product Details Section -->
		<section class="form-section">
			<h2>Product Details</h2>

			<div class="form-row">
				<div class="form-group">
					<label for="brand">
						Brand <span class="required">*</span>
					</label>
					<input
						type="text"
						id="brand"
						name="brand"
						required
						list="brand-list"
						placeholder="Enter brand"
						value={form?.values?.brand || ''}
					/>
					<datalist id="brand-list">
						{#each popularBrands as brand}
							<option value={brand} />
						{/each}
					</datalist>
				</div>

				<div class="form-group">
					<label for="condition">
						Condition <span class="required">*</span>
					</label>
					<select
						id="condition"
						name="condition"
						required
						value={form?.values?.condition || 'like_new'}
					>
						{#each conditions as cond}
							<option value={cond.value}>{cond.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="size">
						Size
					</label>
					<input
						type="text"
						id="size"
						name="size"
						list="size-list"
						placeholder="e.g., M, 42, One Size"
						value={form?.values?.size || ''}
					/>
					<datalist id="size-list">
						{#each commonSizes as size}
							<option value={size} />
						{/each}
					</datalist>
				</div>

				<div class="form-group">
					<label for="color">
						Color
					</label>
					<input
						type="text"
						id="color"
						name="color"
						list="color-list"
						placeholder="Main color"
						value={form?.values?.color || ''}
					/>
					<datalist id="color-list">
						{#each commonColors as color}
							<option value={color} />
						{/each}
					</datalist>
				</div>
			</div>
		</section>

		<!-- Shipping Section -->
		<section class="form-section">
			<h2>
				<Truck size={20} />
				Shipping & Location
			</h2>

			<div class="form-group">
				<label for="location">
					<MapPin size={16} />
					Your City
				</label>
				<input
					type="text"
					id="location"
					name="location"
					placeholder="e.g., Sofia"
					value={form?.values?.location || 'Sofia'}
				/>
			</div>

			<div class="checkbox-group">
				<input
					type="checkbox"
					id="shipping"
					name="shipping_available"
					checked={form?.values?.shipping_available ?? true}
				/>
				<label for="shipping">
					Offer shipping
				</label>
			</div>

			<div class="form-group">
				<label for="shipping_price">
					Shipping Price (BGN)
				</label>
				<input
					type="number"
					id="shipping_price"
					name="shipping_price"
					min="0"
					step="0.01"
					placeholder="5.00"
					value={form?.values?.shipping_price || '5'}
				/>
			</div>
		</section>

		<!-- Submit Button -->
		<button 
			type="submit" 
			class="submit-btn"
			disabled={loading}
		>
			{loading ? 'Creating Listing...' : 'Create Listing'}
		</button>
	</form>
</div>

<style>
	.container {
		max-width: 720px;
		margin: 0 auto;
		padding: 0 1rem;
		padding-bottom: 2rem;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		background: #f3f4f6;
		border-radius: 8px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.back-btn:hover {
		background: #e5e7eb;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.error-banner {
		background: #fee2e2;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-section h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
	}

	.section-hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.required {
		color: #dc2626;
	}

	input[type="text"],
	input[type="number"],
	select,
	textarea {
		width: 100%;
		padding: 0.625rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	textarea {
		resize: vertical;
		font-family: inherit;
	}

	.checkbox-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.checkbox-group input[type="checkbox"] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
	}

	.checkbox-group label {
		cursor: pointer;
		user-select: none;
	}

	.submit-btn {
		padding: 0.875rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #2563eb;
	}

	.submit-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.container {
			padding: 0 0.75rem;
		}
	}
</style>