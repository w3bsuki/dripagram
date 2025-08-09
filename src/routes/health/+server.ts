import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Basic health check endpoint
 * Returns 200 OK with basic service status
 * Used by load balancers and monitoring services
 */
export const GET: RequestHandler = async () => {
	const health = {
		status: 'ok',
		timestamp: new Date().toISOString(),
		service: 'driplo-bg',
		version: '1.0.0',
		uptime: process.uptime(),
		environment: import.meta.env.MODE || 'development'
	};

	return json(health, {
		headers: {
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0'
		}
	});
};