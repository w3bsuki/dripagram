import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // Max 30 like requests per minute per user

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
		
		// Check if product exists
		const { data: product, error: productError } = await supabase
			.from('products')
			.select('id, like_count')
			.eq('id', productId)
			.single();
		
		if (productError || !product) {
			return json({ error: 'Product not found' }, { status: 404 });
		}
		
		// Check if user already liked this product
		// Since there's no likes table in the types, we'll create a simple user_likes table logic
		// First, let's check if user_likes table exists, if not we'll use a simpler approach
		const { data: existingLike, error: likeCheckError } = await supabase
			.from('user_likes')
			.select('id')
			.eq('product_id', productId)
			.eq('user_id', userId)
			.maybeSingle();
		
		let isLiked = false;
		let likeCount = product.like_count;
		
		if (likeCheckError && likeCheckError.code === 'PGRST116') {
			// Table doesn't exist - use a simpler approach with JSON field or create the logic
			// For now, let's assume the table exists and handle the toggle
			return json({ 
				error: 'user_likes table not found - database migration needed' 
			}, { status: 500 });
		}
		
		if (existingLike) {
			// User already liked - remove like
			const { error: deleteError } = await supabase
				.from('user_likes')
				.delete()
				.eq('product_id', productId)
				.eq('user_id', userId);
			
			if (deleteError) {
				return json({ error: 'Failed to remove like' }, { status: 500 });
			}
			
			// Decrement like count
			likeCount = Math.max(0, likeCount - 1);
			isLiked = false;
		} else {
			// User hasn't liked - add like
			const { error: insertError } = await supabase
				.from('user_likes')
				.insert({
					product_id: productId,
					user_id: userId,
					created_at: new Date().toISOString()
				});
			
			if (insertError) {
				return json({ error: 'Failed to add like' }, { status: 500 });
			}
			
			// Increment like count
			likeCount = likeCount + 1;
			isLiked = true;
		}
		
		// Update denormalized like count on products table
		const { error: updateError } = await supabase
			.from('products')
			.update({ like_count: likeCount })
			.eq('id', productId);
		
		if (updateError) {
			// Log error but don't fail the request - the like was still recorded
			console.error('Failed to update product like count:', updateError);
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
			liked: isLiked,
			likeCount: likeCount
		});
		
	} catch (error) {
		console.error('Like API error:', error);
		return json({ 
			error: 'Failed to toggle like',
			success: false 
		}, { status: 500 });
	}
};

// Optional: GET endpoint to check like status
export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const { id: productId } = params;
		
		if (!productId) {
			return json({ error: 'Product ID is required' }, { status: 400 });
		}
		
		const supabase = createSupabaseServerClient(cookies);
		const { data: { session } } = await supabase.auth.getSession();
		
		// Get product like count
		const { data: product } = await supabase
			.from('products')
			.select('like_count')
			.eq('id', productId)
			.single();
		
		let isLiked = false;
		
		if (session?.user) {
			// Check if user has liked this product
			const { data: userLike } = await supabase
				.from('user_likes')
				.select('id')
				.eq('product_id', productId)
				.eq('user_id', session.user.id)
				.maybeSingle();
			
			isLiked = !!userLike;
		}
		
		return json({
			liked: isLiked,
			likeCount: product?.like_count || 0
		});
		
	} catch (error) {
		return json({ 
			error: 'Failed to get like status',
			liked: false,
			likeCount: 0
		}, { status: 500 });
	}
};