/**
 * Utility functions for handling Supabase Storage images
 */

interface ImageTransformOptions {
	width?: number;
	height?: number;
	resize?: 'cover' | 'contain' | 'fill';
	quality?: number;
	format?: 'origin' | 'webp' | 'avif';
}

interface UploadOptions {
	bucket?: string;
	folder?: string;
	fileName?: string;
	upsert?: boolean;
	contentType?: string;
}

/**
 * Get the public URL for a Supabase Storage image
 */
export function getSupabaseImageUrl(
	path: string,
	options?: ImageTransformOptions
): string {
	// This is a placeholder - will be updated when Supabase is configured
	const baseUrl = process.env.PUBLIC_SUPABASE_URL || '';
	const bucketUrl = `${baseUrl}/storage/v1/object/public`;
	
	if (!options) {
		return `${bucketUrl}/${path}`;
	}
	
	const params = new URLSearchParams();
	
	if (options.width) params.append('width', options.width.toString());
	if (options.height) params.append('height', options.height.toString());
	if (options.resize) params.append('resize', options.resize);
	if (options.quality) params.append('quality', options.quality.toString());
	if (options.format) params.append('format', options.format);
	
	const queryString = params.toString();
	return queryString ? `${bucketUrl}/${path}?${queryString}` : `${bucketUrl}/${path}`;
}

/**
 * Generate a unique file name for uploads
 */
export function generateFileName(originalName: string, userId?: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 9);
	const extension = originalName.split('.').pop() || 'jpg';
	const prefix = userId ? `${userId}-` : '';
	
	return `${prefix}${timestamp}-${random}.${extension}`;
}

/**
 * Validate image file
 */
export function validateImageFile(
	file: File,
	maxSizeMB: number = 5,
	allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
): { valid: boolean; error?: string } {
	// Check file type
	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
		};
	}
	
	// Check file size
	const maxSizeBytes = maxSizeMB * 1024 * 1024;
	if (file.size > maxSizeBytes) {
		return {
			valid: false,
			error: `File size exceeds ${maxSizeMB}MB limit`
		};
	}
	
	return { valid: true };
}

/**
 * Compress image before upload
 */
export async function compressImage(
	file: File,
	maxWidth: number = 1920,
	maxHeight: number = 1080,
	quality: number = 0.85
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = (e) => {
			const img = new Image();
			
			img.onload = () => {
				const canvas = document.createElement('canvas');
				let width = img.width;
				let height = img.height;
				
				// Calculate new dimensions
				if (width > maxWidth || height > maxHeight) {
					const aspectRatio = width / height;
					
					if (width > height) {
						width = maxWidth;
						height = width / aspectRatio;
					} else {
						height = maxHeight;
						width = height * aspectRatio;
					}
				}
				
				canvas.width = width;
				canvas.height = height;
				
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}
				
				ctx.drawImage(img, 0, 0, width, height);
				
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error('Failed to compress image'));
						}
					},
					file.type,
					quality
				);
			};
			
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = e.target?.result as string;
		};
		
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = (e) => {
			const img = new Image();
			
			img.onload = () => {
				resolve({
					width: img.width,
					height: img.height
				});
			};
			
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = e.target?.result as string;
		};
		
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

/**
 * Create a thumbnail from an image file
 */
export async function createThumbnail(
	file: File,
	thumbnailSize: number = 200
): Promise<Blob> {
	return compressImage(file, thumbnailSize, thumbnailSize, 0.7);
}

/**
 * Convert image to base64
 */
export function imageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

/**
 * Extract dominant color from image
 */
export async function extractDominantColor(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		
		reader.onload = (e) => {
			const img = new Image();
			
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				
				if (!ctx) {
					reject(new Error('Failed to get canvas context'));
					return;
				}
				
				canvas.width = 1;
				canvas.height = 1;
				ctx.drawImage(img, 0, 0, 1, 1);
				
				const pixel = ctx.getImageData(0, 0, 1, 1).data;
				const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
				resolve(rgb);
			};
			
			img.onerror = () => reject(new Error('Failed to load image'));
			img.src = e.target?.result as string;
		};
		
		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsDataURL(file);
	});
}

/**
 * Parse Supabase storage URL to extract bucket and path
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
	const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)/);
	if (match) {
		return {
			bucket: match[1],
			path: match[2]
		};
	}
	return null;
}

/**
 * Generate picture element sources for responsive images
 */
export function generatePictureSources(
	baseUrl: string,
	options?: {
		formats?: string[];
		sizes?: number[];
	}
): Array<{ srcset: string; type: string }> {
	const formats = options?.formats || ['webp', 'avif'];
	const sizes = options?.sizes || [640, 768, 1024, 1280, 1920];
	
	const sources: Array<{ srcset: string; type: string }> = [];
	
	for (const format of formats) {
		const srcset = sizes
			.map(size => `${getSupabaseImageUrl(baseUrl, { width: size, format: format as any })} ${size}w`)
			.join(', ');
		
		sources.push({
			srcset,
			type: `image/${format}`
		});
	}
	
	return sources;
}

/**
 * Get transformed image URL with specific transformations
 */
export function getTransformedImageUrl(
	url: string,
	transformations: ImageTransformOptions
): string {
	return getSupabaseImageUrl(url, transformations);
}

/**
 * Get optimized image URL with default optimizations
 */
export function getOptimizedImageUrl(
	url: string,
	width?: number,
	quality: number = 80
): string {
	return getSupabaseImageUrl(url, {
		width,
		quality,
		format: 'webp'
	});
}