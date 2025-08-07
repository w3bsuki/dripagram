import { z } from 'zod';

// Step 1: Category selection
export const categorySchema = z.object({
	category: z.string().min(1, 'Please select a category')
});

// Step 2: Images
export const imagesSchema = z.object({
	images: z.array(z.string().url()).min(1, 'Add at least one photo').max(10, 'Maximum 10 photos')
});

// Step 3: Product details
export const detailsSchema = z.object({
	title: z.string()
		.min(3, 'Title must be at least 3 characters')
		.max(100, 'Title must be less than 100 characters'),
	description: z.string()
		.max(500, 'Description must be less than 500 characters')
		.optional(),
	price: z.number()
		.positive('Price must be greater than 0')
		.max(10000, 'Price seems too high'),
	brand: z.string().min(1, 'Select or enter a brand'),
	size: z.string().min(1, 'Select a size'),
	condition: z.enum([
		'new_with_tags',
		'new_without_tags', 
		'like_new',
		'very_good',
		'good',
		'fair'
	]),
	color: z.string().optional(),
	material: z.string().optional()
});

// Step 4: Shipping
export const shippingSchema = z.object({
	location: z.string().min(1, 'Enter your location'),
	shipping_available: z.boolean(),
	shipping_price: z.number().min(0).max(100).optional()
});

// Complete listing schema (all steps combined)
export const listingSchema = z.object({
	// Step 1
	category: categorySchema.shape.category,
	// Step 2
	images: imagesSchema.shape.images,
	// Step 3
	title: detailsSchema.shape.title,
	description: detailsSchema.shape.description,
	price: detailsSchema.shape.price,
	brand: detailsSchema.shape.brand,
	size: detailsSchema.shape.size,
	condition: detailsSchema.shape.condition,
	color: detailsSchema.shape.color,
	material: detailsSchema.shape.material,
	// Step 4
	location: shippingSchema.shape.location,
	shipping_available: shippingSchema.shape.shipping_available,
	shipping_price: shippingSchema.shape.shipping_price,
	// Additional
	tags: z.array(z.string()).max(10).optional()
});

// Schema for each step validation
export const stepSchemas = {
	1: categorySchema,
	2: imagesSchema,
	3: detailsSchema,
	4: shippingSchema
};

// Type exports
export type ListingSchema = typeof listingSchema;
export type CategorySchema = typeof categorySchema;
export type ImagesSchema = typeof imagesSchema;
export type DetailsSchema = typeof detailsSchema;
export type ShippingSchema = typeof shippingSchema;