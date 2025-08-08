import { createClient } from '$lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database.types';

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
		try {
			// Resize image if it's too large (especially for mobile)
			let fileToUpload = file;
			const MAX_SIZE = 5 * 1024 * 1024; // 5MB
			const MAX_DIMENSION = 2000; // Max 2000px width/height
			
			// Check if file needs resizing
			if (file.size > MAX_SIZE || file.type.startsWith('image/')) {
				try {
					fileToUpload = await resizeImage(file, MAX_DIMENSION, MAX_DIMENSION);
				} catch (resizeError) {
					// Continue with original file if resize fails
				}
			}

			// Generate unique filename
			const timestamp = Date.now();
			const randomStr = Math.random().toString(36).substring(7);
			const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
			const filename = `${userId}/${timestamp}-${randomStr}-${index}.${extension}`;

			// Upload to Supabase Storage
			const { data, error } = await supabase.storage.from('listing-images').upload(filename, fileToUpload, {
				cacheControl: '3600',
				upsert: false,
				contentType: fileToUpload.type || 'image/jpeg',
			});

			if (error) {
				// More specific error messages
				if (error.message?.includes('row level security')) {
					throw new Error('Storage permissions error. Please try again or contact support.');
				} else if (error.message?.includes('Bucket not found')) {
					throw new Error('Storage bucket not configured. Please contact support.');
				} else if (error.message?.includes('Payload too large')) {
					throw new Error('Image is too large. Please use a smaller image.');
				} else {
					throw new Error(`Failed to upload image: ${error.message}`);
				}
			}

			// Get public URL
			const {
				data: { publicUrl },
			} = supabase.storage.from('listing-images').getPublicUrl(filename);

			return {
				url: publicUrl,
				filename: filename,
				size: fileToUpload.size,
			};
		} catch (error) {
			throw error;
		}
	});

	return Promise.all(uploadPromises);
}

export async function deleteListingImage(
	filename: string,
	supabase: SupabaseClient<Database>
): Promise<void> {
	const { error } = await supabase.storage.from('listing-images').remove([filename]);

	if (error) {
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
