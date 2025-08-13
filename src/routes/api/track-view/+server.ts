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
		
		// Test database connection
		const { error: testError } = await supabase.from('products').select('id').limit(1);
		if (testError) {
			console.error('Supabase connection test failed:', testError);
			return json({ 
				error: 'Database connection failed',
				success: false 
			}, { status: 500 });
		}
		
		// Simple approach: just increment view_count without complex logic
		let trackedCount = 0;
		
		for (const productId of productIds) {
			try {
				// Use SQL function to increment view count atomically
				const { error: updateError } = await supabase.rpc('increment_view_count', {
					product_id: productId
				});
				
				if (!updateError) {
					trackedCount++;
				} else {
					// Fallback: try direct update
					const { error: fallbackError } = await supabase
						.from('products')
						.update({ view_count: supabase.sql`view_count + 1` })
						.eq('id', productId);
					
					if (!fallbackError) {
						trackedCount++;
					}
				}
			} catch (err) {
				// Continue processing other products even if one fails
				console.warn(`Failed to track view for product ${productId}:`, err);
			}
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
		console.error('Analytics API error:', error);
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