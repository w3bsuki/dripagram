import { z } from 'zod';

// ============================================================
// Analytics Endpoint Schemas
// ============================================================

export const analyticsEventSchema = z.object({
	event_name: z.string().min(1).max(100),
	properties: z.record(z.string(), z.unknown()).optional(),
	user_id: z.string().uuid().optional(),
	session_id: z.string().optional(),
	timestamp: z.string().datetime().optional()
});

export const analyticsTrackRequestSchema = z.object({
	events: z.array(analyticsEventSchema).min(1).max(100),
	client_timestamp: z.string().datetime().optional(),
	user_id: z.string().uuid().optional(),
	session_id: z.string().optional()
});

// ============================================================
// Feed Endpoint Schemas
// ============================================================

export const feedRequestSchema = z.object({
	categories: z.array(z.string()).optional(),
	page: z.number().int().min(0).default(0),
	limit: z.number().int().min(1).max(100).default(20),
	cursor: z.string().optional(),
	user_id: z.string().uuid().optional()
});

// ============================================================
// Consent Endpoint Schemas
// ============================================================

export const consentRequestSchema = z.object({
	accepted: z.boolean(),
	userId: z.string().uuid().optional(),
	ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/).optional()
});

// ============================================================
// Browse Endpoint Schemas
// ============================================================

export const browseFiltersSchema = z.object({
	// Search
	q: z.string().max(100).optional(),
	
	// Categories
	categories: z.array(z.string()).optional(),
	
	// Price range
	min_price: z.number().min(0).optional(),
	max_price: z.number().max(999999).optional(),
	
	// Size filters
	sizes: z.array(z.string()).optional(),
	
	// Brand filter
	brands: z.array(z.string()).optional(),
	
	// Condition
	conditions: z.array(z.enum(['new_with_tags', 'new_without_tags', 'very_good', 'good', 'satisfactory'])).optional(),
	
	// Pagination
	page: z.number().int().min(0).default(0),
	limit: z.number().int().min(1).max(100).default(20),
	
	// Sorting
	sort_by: z.enum(['created_at', 'price', 'engagement_score']).optional(),
	sort_order: z.enum(['asc', 'desc']).optional()
});

// ============================================================
// Product Endpoint Schemas
// ============================================================

export const createProductSchema = z.object({
	title: z.string().min(3).max(100),
	description: z.string().min(10).max(1000),
	price: z.number().positive().max(999999),
	category_id: z.string(),
	brand: z.string().optional(),
	size: z.string().optional(),
	condition: z.enum(['new_with_tags', 'new_without_tags', 'very_good', 'good', 'satisfactory']),
	images: z.array(z.string().url()).min(1).max(10),
	tags: z.array(z.string()).max(10).optional()
});

export const updateProductSchema = createProductSchema.partial();

// ============================================================
// Like/Favorite Schemas
// ============================================================

export const likeRequestSchema = z.object({
	product_id: z.string().uuid(),
	user_id: z.string().uuid().optional()
});

export const favoriteRequestSchema = z.object({
	product_id: z.string().uuid(),
	user_id: z.string().uuid().optional()
});

// ============================================================
// Message Schemas
// ============================================================

export const sendMessageSchema = z.object({
	recipient_id: z.string().uuid(),
	product_id: z.string().uuid().optional(),
	content: z.string().min(1).max(1000),
	message_type: z.enum(['text', 'offer', 'image']).default('text')
});

// ============================================================
// User Profile Schemas
// ============================================================

export const updateProfileSchema = z.object({
	username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
	bio: z.string().max(500).optional(),
	avatar_url: z.string().url().optional(),
	location: z.string().max(100).optional(),
	website: z.string().url().optional()
});

// ============================================================
// Search Schemas
// ============================================================

export const searchRequestSchema = z.object({
	q: z.string().min(1).max(100),
	type: z.enum(['products', 'users', 'all']).default('products'),
	page: z.number().int().min(0).default(0),
	limit: z.number().int().min(1).max(50).default(20)
});

// ============================================================
// Helper Functions
// ============================================================

export function validateRequest<T>(
	schema: z.ZodSchema<T>,
	data: unknown
): { success: true; data: T } | { success: false; error: string } {
	const result = schema.safeParse(data);
	
	if (result.success) {
		return { success: true, data: result.data };
	}
	
	// Format error message
	const errors = result.error.issues.map(err => 
		`${err.path.join('.')}: ${err.message}`
	).join(', ');
	
	return { success: false, error: errors };
}

// ============================================================
// Type Exports
// ============================================================

export type AnalyticsTrackRequest = z.infer<typeof analyticsTrackRequestSchema>;
export type FeedRequest = z.infer<typeof feedRequestSchema>;
export type ConsentRequest = z.infer<typeof consentRequestSchema>;
export type BrowseFilters = z.infer<typeof browseFiltersSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type LikeRequest = z.infer<typeof likeRequestSchema>;
export type FavoriteRequest = z.infer<typeof favoriteRequestSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type SearchRequest = z.infer<typeof searchRequestSchema>;