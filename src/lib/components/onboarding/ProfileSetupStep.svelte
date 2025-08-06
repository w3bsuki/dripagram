<script lang="ts">
	import { Phone, Globe } from '@lucide/svelte';
	import type { ProfileData, BrandData } from './types.js';

	let {
		profileData,
		brandData,
		isBrand = false,
	}: {
		profileData: ProfileData;
		brandData: BrandData;
		isBrand?: boolean;
	} = $props();
</script>

<div class="form-section">
	<div class="form-group">
		<label for="full_name">Full Name</label>
		<input
			id="full_name"
			type="text"
			bind:value={profileData.full_name}
			placeholder="John Doe"
			class="input-field"
		/>
	</div>

	<div class="form-group">
		<label for="phone">Phone Number</label>
		<div class="input-wrapper">
			<Phone size={20} class="input-icon" />
			<input
				id="phone"
				type="tel"
				bind:value={profileData.phone}
				placeholder="+359 88 123 4567"
				class="input-field with-icon"
			/>
		</div>
	</div>

	<div class="form-group">
		<label for="bio">Bio</label>
		<textarea
			id="bio"
			bind:value={profileData.bio}
			placeholder="Tell us about yourself..."
			rows="3"
			class="input-field"
		></textarea>
	</div>

	{#if isBrand}
		<div class="brand-section">
			<h3>Brand Information</h3>

			<div class="form-group">
				<label for="brand_category">Category</label>
				<select id="brand_category" bind:value={brandData.brand_category} class="input-field">
					<option value="">Select category</option>
					<option value="Fashion">Fashion</option>
					<option value="Sportswear">Sportswear</option>
					<option value="Accessories">Accessories</option>
					<option value="Footwear">Footwear</option>
					<option value="Luxury">Luxury</option>
					<option value="Streetwear">Streetwear</option>
					<option value="Vintage">Vintage</option>
				</select>
			</div>

			<div class="form-group">
				<label for="brand_description">Brand Description</label>
				<textarea
					id="brand_description"
					bind:value={brandData.brand_description}
					placeholder="What makes your brand special?"
					rows="3"
					class="input-field"
				></textarea>
			</div>

			<div class="form-group">
				<label for="brand_website">Website</label>
				<div class="input-wrapper">
					<Globe size={20} class="input-icon" />
					<input
						id="brand_website"
						type="url"
						bind:value={brandData.brand_website}
						placeholder="https://yourbrand.com"
						class="input-field with-icon"
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="address-section">
		<h3>Address</h3>
		<div class="form-row">
			<div class="form-group">
				<label for="city">City</label>
				<input
					id="city"
					type="text"
					bind:value={profileData.address.city}
					placeholder="Sofia"
					class="input-field"
				/>
			</div>
			<div class="form-group">
				<label for="postal_code">Postal Code</label>
				<input
					id="postal_code"
					type="text"
					bind:value={profileData.address.postal_code}
					placeholder="1000"
					class="input-field"
				/>
			</div>
		</div>
	</div>
</div>

<style>
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.input-wrapper {
		position: relative;
	}

	:global(.input-icon) {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
	}

	.input-field {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--color-text-primary);
		transition: all 0.2s;
	}

	.input-field.with-icon {
		padding-left: 3rem;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-interactive-primary) / 10;
	}

	textarea.input-field {
		resize: vertical;
		min-height: 100px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.brand-section,
	.address-section {
		margin-top: 2rem;
	}

	.brand-section h3,
	.address-section h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
	}

	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr;
		}
	}
</style>
