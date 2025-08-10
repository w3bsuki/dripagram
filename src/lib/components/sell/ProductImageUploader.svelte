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

<div class="mb-6">
	<div class="mb-4 text-center">
		<h3 class="mb-1 text-lg md:text-xl font-semibold text-gray-900">{m['sell.add_photos']()}</h3>
		<p class="text-xs md:text-sm text-gray-600">{m['sell.add_photo_instruction']()}</p>
	</div>

	<!-- Image Grid -->
	{#if images.length > 0}
		<div class="mb-4 grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
			{#each images as imageUrl, index}
				<div
					class="relative aspect-square cursor-grab overflow-hidden rounded-lg border-2 border-gray-200 active:cursor-grabbing"
					draggable="true"
				>
					<img src={imageUrl} alt="Listing photo {index + 1}" class="h-full w-full object-cover" />
					<button
						class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
						onclick={() => removeImage(index)}
						type="button"
					>
						<X size={16} />
					</button>
					{#if index === 0}
						<div
							class="absolute bottom-1 left-1 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-medium text-white"
						>
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
			class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 md:p-12 text-center transition-all hover:border-blue-600 hover:bg-blue-50 {dragOver
				? 'border-blue-600 bg-blue-50'
				: ''}"
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
				<div class="flex flex-col items-center gap-4">
					<div
						class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
					></div>
					<p class="text-gray-600">{m['sell.uploading_images']()}</p>
				</div>
			{:else}
				<Upload size={32} class="mx-auto mb-4 text-blue-600" />
				<h4 class="mb-2 font-medium text-gray-900">{m['sell.drag_photos_here']()}</h4>
				<p class="text-sm text-gray-600">{m['sell.file_formats']()}</p>
			{/if}
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			multiple
			onchange={(e) => e.target && handleFiles((e.target as HTMLInputElement).files)}
			class="hidden"
		/>
	{/if}

	{#if images.length > 0}
		<div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
			<p class="m-0 text-sm text-blue-700">
				<strong>{m['sell.tips_title']()}</strong> {m['sell.tips_text']()}
			</p>
		</div>
	{/if}
</div>
