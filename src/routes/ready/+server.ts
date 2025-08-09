import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database.types';

/**
 * Comprehensive readiness check endpoint
 * Tests all critical dependencies before serving traffic
 * Returns 200 OK if all dependencies are healthy, 503 Service Unavailable otherwise
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const checks: Record<string, { status: 'ok' | 'error'; latency?: number; error?: string }> = {};
	let allHealthy = true;

	// Check 1: Supabase Database Connection
	try {
		const startTime = Date.now();
		
		// Create a temporary Supabase client for health check
		const supabase = createServerClient<Database>(
			PUBLIC_SUPABASE_URL,
			PUBLIC_SUPABASE_ANON_KEY,
			{
				cookies: {
					get: (key) => cookies.get(key),
					set: (key, value, options) => cookies.set(key, value, options),
					remove: (key, options) => cookies.delete(key, options)
				}
			}
		);

		// Simple query to test database connectivity
		const { data, error: dbError } = await supabase
			.from('profiles')
			.select('count')
			.limit(1)
			.maybeSingle();

		const latency = Date.now() - startTime;

		if (dbError) {
			checks.database = { 
				status: 'error', 
				latency, 
				error: dbError.message 
			};
			allHealthy = false;
		} else {
			checks.database = { 
				status: 'ok', 
				latency 
			};
		}
	} catch (err) {
		checks.database = { 
			status: 'error', 
			error: err instanceof Error ? err.message : 'Unknown database error' 
		};
		allHealthy = false;
	}

	// Check 2: Supabase Auth Service
	try {
		const startTime = Date.now();
		
		const supabase = createServerClient<Database>(
			PUBLIC_SUPABASE_URL,
			PUBLIC_SUPABASE_ANON_KEY,
			{
				cookies: {
					get: (key) => cookies.get(key),
					set: (key, value, options) => cookies.set(key, value, options),
					remove: (key, options) => cookies.delete(key, options)
				}
			}
		);

		// Test auth service by trying to get session (will return null for anonymous)
		const { data, error: authError } = await supabase.auth.getSession();
		const latency = Date.now() - startTime;

		if (authError) {
			checks.auth = { 
				status: 'error', 
				latency, 
				error: authError.message 
			};
			allHealthy = false;
		} else {
			checks.auth = { 
				status: 'ok', 
				latency 
			};
		}
	} catch (err) {
		checks.auth = { 
			status: 'error', 
			error: err instanceof Error ? err.message : 'Unknown auth error' 
		};
		allHealthy = false;
	}

	// Check 3: Environment Variables
	try {
		const requiredEnvVars = [
			'PUBLIC_SUPABASE_URL',
			'PUBLIC_SUPABASE_ANON_KEY'
		];

		const missingVars = requiredEnvVars.filter(varName => {
			switch (varName) {
				case 'PUBLIC_SUPABASE_URL':
					return !PUBLIC_SUPABASE_URL;
				case 'PUBLIC_SUPABASE_ANON_KEY':
					return !PUBLIC_SUPABASE_ANON_KEY;
				default:
					return false;
			}
		});

		if (missingVars.length > 0) {
			checks.environment = {
				status: 'error',
				error: `Missing environment variables: ${missingVars.join(', ')}`
			};
			allHealthy = false;
		} else {
			checks.environment = { status: 'ok' };
		}
	} catch (err) {
		checks.environment = {
			status: 'error',
			error: err instanceof Error ? err.message : 'Unknown environment error'
		};
		allHealthy = false;
	}

	// Check 4: Memory Usage
	try {
		const memUsage = process.memoryUsage();
		const memUsageMB = {
			rss: Math.round(memUsage.rss / 1024 / 1024),
			heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
			heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
			external: Math.round(memUsage.external / 1024 / 1024)
		};

		// Alert if heap usage is over 512MB (adjust threshold as needed)
		if (memUsageMB.heapUsed > 512) {
			checks.memory = {
				status: 'error',
				error: `High memory usage: ${memUsageMB.heapUsed}MB heap used`,
				...memUsageMB
			};
			allHealthy = false;
		} else {
			checks.memory = {
				status: 'ok',
				...memUsageMB
			};
		}
	} catch (err) {
		checks.memory = {
			status: 'error',
			error: err instanceof Error ? err.message : 'Unknown memory error'
		};
		allHealthy = false;
	}

	const response = {
		status: allHealthy ? 'ready' : 'not_ready',
		timestamp: new Date().toISOString(),
		service: 'driplo-bg',
		version: '1.0.0',
		environment: import.meta.env.MODE || 'development',
		checks,
		summary: {
			total: Object.keys(checks).length,
			healthy: Object.values(checks).filter(c => c.status === 'ok').length,
			unhealthy: Object.values(checks).filter(c => c.status === 'error').length
		}
	};

	if (allHealthy) {
		return json(response, {
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			}
		});
	} else {
		return json(response, {
			status: 503,
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			}
		});
	}
};