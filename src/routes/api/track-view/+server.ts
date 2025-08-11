import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 view tracking requests per minute

function checkRateLimit(identifier: string): boolean {
	const now = Date.now();
	const limit = rateLimitMap.get(identifier);
	
	if (!limit || limit.resetTime < now) {
		rateLimitMap.set(identifier, {
			count: 1,
			resetTime: now + RATE_LIMIT_WINDOW
		});
		return true;
	}
	
	if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
		return false;
	}
	
	limit.count++;
	return true;
}

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	try {
		// Get request data
		const { productIds } = await request.json();
		
		// Validate input
		if (!Array.isArray(productIds) || productIds.length === 0) {
			return json({ error: 'Invalid product IDs' }, { status: 400 });
		}
		
		// Limit batch size
		if (productIds.length > 50) {
			return json({ error: 'Too many product IDs (max 50)' }, { status: 400 });
		}
		
		// Get client IP for rate limiting
		const clientIp = getClientAddress();
		
		// Check rate limit
		if (!checkRateLimit(clientIp)) {
			return json({ error: 'Rate limit exceeded' }, { status: 429 });
		}
		
		// Initialize Supabase client
		const supabase = createSupabaseServerClient(cookies);
		
		// Get user session (optional - views can be anonymous)
		const { data: { session } } = await supabase.auth.getSession();
		const userId = session?.user?.id || null;
		
		// Get user agent for analytics
		const userAgent = request.headers.get('user-agent') || null;
		
		// Prepare view records
		const viewRecords = productIds.map(productId => ({
			product_id: productId,
			user_id: userId,
			ip_address: clientIp,
			user_agent: userAgent,
			viewed_at: new Date().toISOString()
		}));
		
		// Update view counts directly on products/listings tables
		// Since product_views table may not exist, use a simpler approach
		let trackedCount = 0;
		
		for (const productId of productIds) {
			// Get current view count and increment it
			const { data: product } = await supabase
				.from('products')
				.select('view_count')
				.eq('id', productId)
				.single();
			
			if (product) {
				// Update products table
				const newViewCount = (product.view_count || 0) + 1;
				const { error: productUpdateError } = await supabase
					.from('products')
					.update({ view_count: newViewCount })
					.eq('id', productId);
				
				if (!productUpdateError) {
					trackedCount++;
				}
			} else {
				// Try listings table as fallback
				const { data: listing } = await supabase
					.from('listings')
					.select('view_count')
					.eq('id', productId)
					.single();
				
				if (listing) {
					const newViewCount = (listing.view_count || 0) + 1;
					const { error: listingUpdateError } = await supabase
						.from('listings')
						.update({ view_count: newViewCount })
						.eq('id', productId);
					
					if (!listingUpdateError) {
						trackedCount++;
					}
				}
			}
			
			// Optional: Insert into product_views table for detailed analytics
			// (only if table exists - ignore errors if it doesn't)
			const viewRecord = {
				product_id: productId,
				user_id: userId,
				ip_address: clientIp,
				user_agent: userAgent,
				viewed_at: new Date().toISOString()
			};
			
			// Try to insert view record, but don't fail if table doesn't exist
			await supabase.from('product_views').insert(viewRecord).catch(() => {
				// Silently ignore - table may not exist
			});
		}
		
		// Clean up old rate limit entries periodically
		if (Math.random() < 0.01) { // 1% chance
			const now = Date.now();
			for (const [key, value] of rateLimitMap.entries()) {
				if (value.resetTime < now - RATE_LIMIT_WINDOW * 2) {
					rateLimitMap.delete(key);
				}
			}
		}
		
		return json({ 
			success: true, 
			tracked: trackedCount 
		});
		
	} catch (error) {
		return json({ 
			error: 'Failed to track views',
			success: false 
		}, { status: 500 });
	}
};

// Optional: GET endpoint to check rate limit status
export const GET: RequestHandler = async ({ getClientAddress }) => {
	const clientIp = getClientAddress();
	const limit = rateLimitMap.get(clientIp);
	
	if (!limit || limit.resetTime < Date.now()) {
		return json({
			remaining: RATE_LIMIT_MAX_REQUESTS,
			resetTime: null
		});
	}
	
	return json({
		remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - limit.count),
		resetTime: limit.resetTime
	});
};