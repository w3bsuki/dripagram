<script lang="ts">
	import { page } from '$app/stores';
	import { X, Upload, Image } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	let { 
		maxImages = 10, 
		onImagesChange 
	}: {
		maxImages?: number;
		onImagesChange: (urls: string[]) => void;
	} = $props();

	let images = $state<string[]>([]);
	let uploading = $state(false);
	let dragActive = $state(false);
	let fileInput = $state<HTMLInputElement | null>(null);

	async function uploadToSupabase(file: File): Promise<string | null> {
		const supabase = $page.data.supabase;
		const user = $page.data.user;
		
		if (!supabase || !user) {
			toast.error('Please login to upload images');
			return null;
		}

		const fileExt = file.name.split('.').pop();
		const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
		
		const { data, error } = await supabase.storage
			.from('listing-images')
			.upload(fileName, file, {
				cacheControl: '3600',
				upsert: false
			});

		if (error) {
			console.error('Upload error:', error);
			return null;
		}

		const { data: { publicUrl } } = supabase.storage
			.from('listing-images')
			.getPublicUrl(fileName);

		return publicUrl;
	}

	async function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;
		
		const remainingSlots = maxImages - images.length;
		if (remainingSlots <= 0) {
			toast.error(`Maximum ${maxImages} images allowed`);
			return;
		}

		const filesToUpload = Array.from(files).slice(0, remainingSlots);
		
		// Validate file types
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		const invalidFiles = filesToUpload.filter(f => !validTypes.includes(f.type));
		
		if (invalidFiles.length > 0) {
			toast.error('Only JPG, PNG and WebP images are allowed');
			return;
		}

		// Validate file sizes (max 10MB each)
		const oversizedFiles = filesToUpload.filter(f => f.size > 10 * 1024 * 1024);
		if (oversizedFiles.length > 0) {
			toast.error('Images must be under 10MB');
			return;
		}

		uploading = true;

		try {
			const uploadPromises = filesToUpload.map(uploadToSupabase);
			const results = await Promise.all(uploadPromises);
			const successfulUploads = results.filter((url): url is string => url !== null);
			
			if (successfulUploads.length > 0) {
				images = [...images, ...successfulUploads];
				onImagesChange(images);
				toast.success(`${successfulUploads.length} image(s) uploaded`);
			}
			
			if (successfulUploads.length < filesToUpload.length) {
				toast.error(`${filesToUpload.length - successfulUploads.length} image(s) failed to upload`);
			}
		} catch (err) {
			console.error('Upload error:', err);
			toast.error('Failed to upload images');
		} finally {
			uploading = false;
		}
	}

	function removeImage(index: number) {
		images = images.filter((_, i) => i !== index);
		onImagesChange(images);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		handleFiles(e.dataTransfer?.files || null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
	}
</script>

<div class="image-upload">
	{#if images.length > 0}
		<div class="image-grid">
			{#each images as image, index}
				<div class="image-item">
					<img src={image} alt="Product {index + 1}" />
					<button
						type="button"
						class="remove-btn"
						onclick={() => removeImage(index)}
						aria-label="Remove image"
					>
						<X size={16} />
					</button>
					{#if index === 0}
						<span class="main-badge">Main</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if images.length < maxImages}
		<div
			class="upload-area"
			class:drag-active={dragActive}
			class:uploading
			ondrop={handleDrop}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			onclick={() => !uploading && fileInput?.click()}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && !uploading && fileInput?.click()}
		>
			{#if uploading}
				<div class="loading">
					<div class="spinner"></div>
					<p>Uploading...</p>
				</div>
			{:else}
				<Upload size={32} />
				<p class="upload-text">Click or drag images here</p>
				<p class="upload-hint">JPG, PNG, WebP up to 10MB</p>
			{/if}
		</div>

		<input
			bind:this={fileInput}
			type="file"
			accept="image/jpeg,image/jpg,image/png,image/webp"
			multiple
			onchange={(e) => handleFiles(e.currentTarget.files)}
			class="hidden"
		/>
	{/if}

	<div class="image-info">
		<Image size={16} />
		<span>{images.length}/{maxImages} images</span>
	</div>
</div>

<style>
	.image-upload {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.image-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 0.75rem;
	}

	.image-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 8px;
		overflow: hidden;
		background: #f5f5f5;
	}

	.image-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s;
	}

	.remove-btn:hover {
		background: rgba(0, 0, 0, 0.9);
	}

	.main-badge {
		position: absolute;
		bottom: 4px;
		left: 4px;
		background: #3b82f6;
		color: white;
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
	}

	.upload-area {
		border: 2px dashed #d1d5db;
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
		background: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		color: #6b7280;
	}

	.upload-area:hover:not(.uploading) {
		border-color: #3b82f6;
		background: #f0f9ff;
	}

	.upload-area.drag-active {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.upload-area.uploading {
		cursor: not-allowed;
		opacity: 0.7;
	}

	.upload-text {
		font-weight: 500;
		color: #111827;
		margin: 0;
	}

	.upload-hint {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		margin: 0;
		color: #6b7280;
	}

	.image-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.hidden {
		display: none;
	}

	@media (min-width: 640px) {
		.image-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		}
	}
</style>