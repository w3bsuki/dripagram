<script lang="ts">
	import { uploadListingImages, type ImageUploadResult } from '$lib/services/imageService';
	import { X, Upload, Camera } from '@lucide/svelte';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import type { ProductImageUploaderProps } from './types';
	import * as m from '$lib/paraglide/messages';

	let { images, userId, onImagesChange }: ProductImageUploaderProps = $props();

	let uploading = $state(false);
	let dragOver = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	async function handleFiles(files: FileList | null) {
		if (!files) return;

		const fileArray = Array.from(files);
		if (fileArray.length === 0) return;

		// Limit to 10 images total
		if (images.length + fileArray.length > 10) {
			toast.error('Maximum 10 images allowed per listing');
			return;
		}

		// Check if userId is available
		if (!userId) {
			toast.error('Please sign in to upload images');
			return;
		}

		uploading = true;
		toast.info(`Uploading ${fileArray.length} image${fileArray.length > 1 ? 's' : ''}...`);

		try {
			// Get supabase from page data
			const supabase = $page.data.supabase;
			if (!supabase) {
				throw new Error('Authentication error. Please refresh the page and try again.');
			}
			
			const uploadResults = await uploadListingImages(fileArray, userId, supabase);
			const newImages = [...images, ...uploadResults.map((r) => r.url)];
			onImagesChange(newImages);
			toast.success(`Successfully uploaded ${uploadResults.length} image${uploadResults.length > 1 ? 's' : ''}`);
		} catch (error: any) {
			
			// Show specific error message
			const errorMessage = error?.message || 'Failed to upload images';
			toast.error(errorMessage);
			
			// Additional help for common issues
			if (errorMessage.includes('Storage permissions') || errorMessage.includes('Bucket not found')) {
				toast.info('This might be a configuration issue. Please try again later or contact support.');
			}
		} finally {
			uploading = false;
		}
	}

	function removeImage(index: number) {
		const newImages = images.filter((_, i) => i !== index);
		onImagesChange(newImages);
	}

	function moveImage(from: number, to: number) {
		const newImages = [...images];
		const [moved] = newImages.splice(from, 1);
		newImages.splice(to, 0, moved);
		onImagesChange(newImages);
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function onDragLeave() {
		dragOver = false;
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		handleFiles(event.dataTransfer?.files || null);
	}
</script>

<div class="image-uploader">
	<div class="uploader-header">
		<h3 class="uploader-title">{m['sell.add_photos']()}</h3>
		<p class="uploader-subtitle">{m['sell.add_photo_instruction']()}</p>
	</div>

	<!-- Image Grid -->
	{#if images.length > 0}
		<div class="image-grid">
			{#each images as imageUrl, index}
				<div
					class="image-item"
					draggable="true"
				>
					<img src={imageUrl} alt="Listing photo {index + 1}" class="image-preview" />
					<button
						class="remove-button"
						onclick={() => removeImage(index)}
						type="button"
					>
						<X size={16} />
					</button>
					{#if index === 0}
						<div class="main-photo-badge">
							{m['sell.main_photo']()}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Upload Area -->
	{#if images.length < 10}
		<div
			class="upload-area {dragOver ? 'drag-over' : ''}"
			role="button"
			tabindex="0"
			ondragover={onDragOver}
			ondragleave={onDragLeave}
			ondrop={onDrop}
			onclick={() => fileInput?.click()}
			onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
			aria-label="Upload images"
		>
			{#if uploading}
				<div class="upload-status">
					<div class="spinner"></div>
					<p class="upload-text">{m['sell.uploading_images']()}</p>
				</div>
			{:else}
				<Upload size={32} class="upload-icon" />
				<h4 class="upload-title">{m['sell.drag_photos_here']()}</h4>
				<p class="upload-subtitle">{m['sell.file_formats']()}</p>
			{/if}
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			multiple
			onchange={(e) => e.target && handleFiles((e.target as HTMLInputElement).files)}
			class="file-input"
		/>
	{/if}

	{#if images.length > 0}
		<div class="tips-section">
			<p class="tips-text">
				<strong>{m['sell.tips_title']()}</strong> {m['sell.tips_text']()}
			</p>
		</div>
	{/if}
</div>

<style>
	.image-uploader {
		margin-bottom: var(--space-6);
	}

	.uploader-header {
		margin-bottom: var(--space-4);
		text-align: center;
	}

	.uploader-title {
		margin-bottom: var(--space-1);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.uploader-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		line-height: 1.4;
		margin: 0;
	}

	/* Image Grid */
	.image-grid {
		margin-bottom: var(--space-4);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-2);
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
		cursor: grab;
		overflow: hidden;
		border-radius: var(--border-radius-lg);
		border: 2px solid var(--color-border-primary);
		background: var(--color-surface-secondary);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.image-item:active {
		cursor: grabbing;
	}

	.image-item:hover {
		border-color: var(--color-interactive-primary);
		box-shadow: var(--shadow-md);
	}

	.image-preview {
		height: 100%;
		width: 100%;
		object-fit: cover;
		display: block;
	}

	.remove-button {
		position: absolute;
		top: var(--space-1);
		right: var(--space-1);
		display: flex;
		height: 24px;
		width: 24px;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-full);
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		backdrop-filter: blur(4px);
		-webkit-tap-highlight-color: transparent;
	}

	.remove-button:hover {
		background: rgba(0, 0, 0, 0.9);
		transform: scale(1.1);
	}

	.remove-button:focus-visible {
		outline: 2px solid var(--color-surface-primary);
		outline-offset: 2px;
	}

	.remove-button:active {
		transform: scale(0.95);
	}

	.main-photo-badge {
		position: absolute;
		bottom: var(--space-1);
		left: var(--space-1);
		border-radius: var(--border-radius-sm);
		background: var(--color-interactive-primary);
		padding: var(--space-1) var(--space-1-5);
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: white;
		font-family: var(--font-family-sans);
		letter-spacing: 0.01em;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	/* Upload Area */
	.upload-area {
		cursor: pointer;
		border-radius: var(--border-radius-xl);
		border: 2px dashed var(--color-border-primary);
		background: var(--color-surface-secondary);
		padding: var(--space-8);
		text-align: center;
		transition: all var(--duration-fast) var(--ease-out);
		outline: none;
		-webkit-tap-highlight-color: transparent;
		position: relative;
		overflow: hidden;
	}

	.upload-area:hover,
	.upload-area.drag-over {
		border-color: var(--color-interactive-primary);
		background: var(--color-surface-brand-subtle);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.upload-area:focus-visible {
		outline: 3px solid rgba(37, 99, 235, 0.2);
		outline-offset: 2px;
	}

	.upload-area:active {
		transform: scale(0.99);
	}

	.upload-status {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.spinner {
		height: 32px;
		width: 32px;
		border: 2px solid var(--color-border-primary);
		border-top: 2px solid var(--color-interactive-primary);
		border-radius: var(--border-radius-full);
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.upload-text {
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.upload-icon {
		margin: 0 auto var(--space-4) auto;
		color: var(--color-interactive-primary);
		display: block;
	}

	.upload-title {
		margin-bottom: var(--space-2);
		font-weight: 500;
		color: var(--color-text-primary);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-base);
		line-height: 1.4;
	}

	.upload-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-family: var(--font-family-sans);
		line-height: 1.4;
		margin: 0;
	}

	.file-input {
		display: none;
	}

	/* Tips Section */
	.tips-section {
		margin-top: var(--space-4);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-border-primary);
		background: var(--color-surface-brand-subtle);
		padding: var(--space-3);
	}

	.tips-text {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-brand);
		font-family: var(--font-family-sans);
		line-height: 1.4;
	}

	/* Responsive Design */
	@media (min-width: 768px) {
		.image-grid {
			grid-template-columns: repeat(4, 1fr);
			gap: var(--space-4);
		}

		.uploader-title {
			font-size: var(--font-size-xl);
		}

		.uploader-subtitle {
			font-size: var(--font-size-sm);
		}

		.upload-area {
			padding: var(--space-12);
		}
	}

	/* High contrast support */
	@media (prefers-contrast: high) {
		.remove-button {
			border: 2px solid white;
		}
		
		.upload-area {
			border-width: 3px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.image-item,
		.upload-area,
		.remove-button,
		.spinner {
			transition-duration: 0.01ms;
		}
		
		.upload-area:hover {
			transform: none;
		}
		
		.spinner {
			animation: none;
		}
	}
</style>
