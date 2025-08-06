import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

const supabase = createClient();

export interface ImageUploadResult {
	url: string;
	filename: string;
	size: number;
}

export async function uploadListingImages(
	files: File[],
	userId: string,
	supabase: SupabaseClient<Database>
): Promise<ImageUploadResult[]> {
	if (!files || files.length === 0) return [];

	const uploadPromises = files.map(async (file, index) => {
		// Generate unique filename
		const timestamp = Date.now();
		const extension = file.name.split('.').pop() || 'jpg';
		const filename = `${userId}/${timestamp}-${index}.${extension}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage.from('listing-images').upload(filename, file, {
			cacheControl: '3600',
			upsert: false,
		});

		if (error) {
			console.error('Upload error:', error);
			throw new Error(`Failed to upload image: ${error.message}`);
		}

		// Get public URL
		const {
			data: { publicUrl },
		} = supabase.storage.from('listing-images').getPublicUrl(filename);

		return {
			url: publicUrl,
			filename: filename,
			size: file.size,
		};
	});

	return Promise.all(uploadPromises);
}

export async function deleteListingImage(
	filename: string,
	supabase: SupabaseClient<Database>
): Promise<void> {
	const { error } = await supabase.storage.from('listing-images').remove([filename]);

	if (error) {
		console.error('Delete error:', error);
		throw new Error(`Failed to delete image: ${error.message}`);
	}
}

export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<File> {
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		const img = new Image();

		img.onload = () => {
			// Calculate new dimensions
			let { width, height } = img;

			if (width > height) {
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}
			} else {
				if (height > maxHeight) {
					width = (width * maxHeight) / height;
					height = maxHeight;
				}
			}

			canvas.width = width;
			canvas.height = height;

			// Draw resized image
			ctx.drawImage(img, 0, 0, width, height);

			// Convert to blob
			canvas.toBlob(
				(blob) => {
					if (blob) {
						const resizedFile = new File([blob], file.name, {
							type: file.type,
							lastModified: Date.now(),
						});
						resolve(resizedFile);
					}
				},
				file.type,
				0.9
			);
		};

		img.src = URL.createObjectURL(file);
	});
}
