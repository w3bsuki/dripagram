import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50; // Max 50 save requests per minute per user

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

export const POST: RequestHandler = async ({ params, cookies, getClientAddress }) => {
	try {
		const { id: productId } = params;
		
		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}
		
		// Initialize Supabase client
		const supabase = createSupabaseServerClient(cookies);
		
		// Get authenticated user session
		const { data: { session }, error: sessionError } = await supabase.auth.getSession();
		
		if (sessionError || !session?.user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}
		
		const userId = session.user.id;
		const clientIp = getClientAddress();
		
		// Check rate limit
		if (!checkRateLimit(`${userId}-${clientIp}`)) {
			return json({ error: 'Rate limit exceeded' }, { status: 429 });
		}
		
		// Check if product exists (both in products and listings tables)
		let productExists = false;
		let listingId = null;
		
		// First check products table
		const { data: product } = await supabase
			.from('products')
			.select('id')
			.eq('id', productId)
			.maybeSingle();
		
		if (product) {
			productExists = true;
			listingId = productId;
		} else {
			// Check listings table as fallback
			const { data: listing } = await supabase
				.from('listings')
				.select('id')
				.eq('id', productId)
				.maybeSingle();
			
			if (listing) {
				productExists = true;
				listingId = productId;
			}
		}
		
		if (!productExists) {
			return json({ error: 'Product not found' }, { status: 404 });
		}
		
		// Check if user already saved this product using the favorites table
		const { data: existingSave, error: saveCheckError } = await supabase
			.from('favorites')
			.select('id')
			.eq('product_id', listingId)
			.eq('user_id', userId)
			.maybeSingle();
		
		if (saveCheckError && saveCheckError.code !== 'PGRST116') {
			return json({ error: 'Failed to check save status' }, { status: 500 });
		}
		
		let isSaved = false;
		
		if (existingSave) {
			// User already saved - remove save
			const { error: deleteError } = await supabase
				.from('favorites')
				.delete()
				.eq('product_id', listingId)
				.eq('user_id', userId);
			
			if (deleteError) {
				return json({ error: 'Failed to remove from favorites' }, { status: 500 });
			}
			
			isSaved = false;
		} else {
			// User hasn't saved - add to favorites
			const { error: insertError } = await supabase
				.from('favorites')
				.insert({
					user_id: userId,
					product_id: listingId,
					created_at: new Date().toISOString()
				});
			
			if (insertError) {
				// Handle duplicate key error gracefully
				if (insertError.code === '23505') {
					isSaved = true;
				} else {
					return json({ error: 'Failed to add to favorites' }, { status: 500 });
				}
			} else {
				isSaved = true;
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
			saved: isSaved
		});
		
	} catch (error) {
		console.error('Save API error:', error);
		return json({ 
			error: 'Failed to toggle save',
			success: false 
		}, { status: 500 });
	}
};

// Optional: GET endpoint to check save status
export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id: productId } = params;
		
		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}
		
		const supabase = createSupabaseServerClient(cookies);
		const { data: { session } } = await supabase.auth.getSession();
		
		if (!session?.user) {
			return json({ saved: false });
		}
		
		// Check if user has saved this product
		const { data: userSave } = await supabase
			.from('favorites')
			.select('id')
			.eq('product_id', productId)
			.eq('user_id', session.user.id)
			.maybeSingle();
		
		return json({
			saved: !!userSave
		});
		
	} catch (error) {
		return json({ 
			error: 'Failed to get save status',
			saved: false
		}, { status: 500 });
	}
};