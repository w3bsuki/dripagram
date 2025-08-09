/**
 * Rate Limiting Utility for API Protection
 * 
 * Implements a token bucket algorithm for rate limiting with:
 * - Per-IP and per-user limits
 * - Exponential backoff
 * - Memory-based storage (upgrade to Redis for production scaling)
 */

export interface RateLimitConfig {
	windowMs: number;    // Time window in milliseconds
	maxRequests: number; // Max requests per window
	skipSuccessfulRequests?: boolean;
	skipFailedRequests?: boolean;
	keyGenerator?: (identifier: string) => string;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
	blocked?: number; // Exponential backoff time
}

class InMemoryRateLimiter {
	private store = new Map<string, RateLimitEntry>();
	
	// Clean up expired entries every 5 minutes
	private cleanup = setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of this.store.entries()) {
			if (entry.resetTime < now && (!entry.blocked || entry.blocked < now)) {
				this.store.delete(key);
			}
		}
	}, 5 * 60 * 1000);

	async check(key: string, config: RateLimitConfig): Promise<{
		allowed: boolean;
		remaining: number;
		resetTime: number;
		retryAfter?: number;
	}> {
		const now = Date.now();
		const entry = this.store.get(key);

		// Check if currently blocked (exponential backoff)
		if (entry?.blocked && entry.blocked > now) {
			return {
				allowed: false,
				remaining: 0,
				resetTime: entry.resetTime,
				retryAfter: Math.ceil((entry.blocked - now) / 1000)
			};
		}

		// Reset window if expired
		if (!entry || entry.resetTime <= now) {
			const newEntry: RateLimitEntry = {
				count: 1,
				resetTime: now + config.windowMs
			};
			this.store.set(key, newEntry);
			
			return {
				allowed: true,
				remaining: config.maxRequests - 1,
				resetTime: newEntry.resetTime
			};
		}

		// Increment counter
		entry.count++;

		// Check if limit exceeded
		if (entry.count > config.maxRequests) {
			// Apply exponential backoff (starts at 1 minute, doubles each time)
			const backoffTime = Math.min(
				entry.blocked ? 
					(entry.blocked - entry.resetTime) * 2 : 
					60 * 1000, // Start with 1 minute
				30 * 60 * 1000 // Max 30 minutes
			);
			
			entry.blocked = now + backoffTime;
			this.store.set(key, entry);

			return {
				allowed: false,
				remaining: 0,
				resetTime: entry.resetTime,
				retryAfter: Math.ceil(backoffTime / 1000)
			};
		}

		this.store.set(key, entry);
		
		return {
			allowed: true,
			remaining: config.maxRequests - entry.count,
			resetTime: entry.resetTime
		};
	}

	// Graceful cleanup
	destroy() {
		clearInterval(this.cleanup);
		this.store.clear();
	}
}

// Singleton instance
const rateLimiter = new InMemoryRateLimiter();

export { rateLimiter };

/**
 * Rate Limiting Presets for Different Endpoints
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
	// General API endpoints
	api: {
		windowMs: 15 * 60 * 1000, // 15 minutes
		maxRequests: 300          // 300 requests per 15 minutes
	},
	
	// Authentication endpoints (stricter)
	auth: {
		windowMs: 15 * 60 * 1000, // 15 minutes  
		maxRequests: 20           // 20 attempts per 15 minutes
	},
	
	// Search endpoints (moderate)
	search: {
		windowMs: 60 * 1000,      // 1 minute
		maxRequests: 60           // 60 searches per minute
	},
	
	// Like/favorite actions (social)
	social: {
		windowMs: 60 * 1000,      // 1 minute
		maxRequests: 100          // 100 actions per minute
	},
	
	// Analytics tracking
	analytics: {
		windowMs: 60 * 1000,      // 1 minute
		maxRequests: 200          // 200 events per minute
	},
	
	// Upload endpoints (very strict)
	upload: {
		windowMs: 60 * 60 * 1000, // 1 hour
		maxRequests: 50           // 50 uploads per hour
	}
};

/**
 * Generate rate limit key based on IP and optional user ID
 */
export function generateRateLimitKey(
	ip: string, 
	userId?: string, 
	endpoint?: string
): string {
	const parts = [ip];
	if (userId) parts.push(`user:${userId}`);
	if (endpoint) parts.push(`endpoint:${endpoint}`);
	return parts.join(':');
}

/**
 * Check rate limit and return appropriate Response if exceeded
 */
export async function checkRateLimit(
	identifier: string,
	config: RateLimitConfig,
	endpoint?: string
): Promise<{ allowed: boolean; response?: Response }> {
	const key = endpoint ? `${endpoint}:${identifier}` : identifier;
	const result = await rateLimiter.check(key, config);

	if (!result.allowed) {
		const response = new Response(
			JSON.stringify({
				error: 'Rate limit exceeded',
				message: 'Too many requests. Please try again later.',
				retryAfter: result.retryAfter,
				resetTime: new Date(result.resetTime).toISOString()
			}),
			{
				status: 429,
				headers: {
					'Content-Type': 'application/json',
					'Retry-After': result.retryAfter?.toString() || '60',
					'X-RateLimit-Limit': config.maxRequests.toString(),
					'X-RateLimit-Remaining': '0',
					'X-RateLimit-Reset': result.resetTime.toString()
				}
			}
		);

		return { allowed: false, response };
	}

	return { allowed: true };
}