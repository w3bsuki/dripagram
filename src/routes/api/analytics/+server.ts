import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { analyticsTrackRequestSchema, validateRequest } from '$lib/schemas/api';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const requestBody = await request.json();
		
		// Validate request body with zod schema
		const validation = validateRequest(analyticsTrackRequestSchema, requestBody);
		if (!validation.success) {
			return json({ 
				error: 'Invalid request format',
				details: validation.error 
			}, { status: 400 });
		}

		const { events, client_timestamp } = validation.data;

		// Get user info from session if available
		const supabase = createSupabaseServerClient(cookies);
		const { data: { session } } = await supabase.auth.getSession();

		// Process events in batches
		const processedEvents = events.map((event: any) => ({
			event_name: event.name,
			event_params: JSON.stringify(event.params),
			user_id: session?.user?.id || event.params?.user_id || null,
			session_id: event.params?.session_id || null,
			timestamp: new Date(event.params?.timestamp || Date.now()),
			page_url: event.params?.page_url || null,
			page_title: event.params?.page_title || null,
			user_agent: event.params?.user_agent || null,
			client_timestamp: new Date(client_timestamp || Date.now()),
			created_at: new Date().toISOString()
		}));

		// Store events in database
		const { error: insertError } = await supabase
			.from('analytics_events')
			.insert(processedEvents);

		if (insertError) {
			console.error('Analytics storage error:', insertError);
			return json({ error: 'Failed to store events' }, { status: 500 });
		}

		// Also send to external analytics if configured
		await Promise.allSettled([
			sendToGoogleAnalytics(events, session?.user?.id),
			sendToCustomAnalytics(events, session?.user?.id)
		]);

		return json({ 
			success: true, 
			processed: processedEvents.length 
		});

	} catch (error) {
		console.error('Analytics API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

/**
 * Send events to Google Analytics 4
 */
async function sendToGoogleAnalytics(events: any[], userId?: string) {
	// Only send if GA is configured
	const measurementId = process.env.GA4_MEASUREMENT_ID;
	const apiSecret = process.env.GA4_API_SECRET;
	
	if (!measurementId || !apiSecret) {
		return;
	}

	try {
		const payload = {
			client_id: userId || 'anonymous', 
			events: events.map(event => ({
				name: event.name,
				params: {
					...event.params,
					// GA4 specific params
					engagement_time_msec: event.params.session_duration || 100,
					session_id: event.params.session_id
				}
			}))
		};

		await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
	} catch (error) {
		console.warn('Failed to send to Google Analytics:', error);
	}
}

/**
 * Send events to custom analytics platform
 */
async function sendToCustomAnalytics(events: any[], userId?: string) {
	const endpoint = process.env.CUSTOM_ANALYTICS_ENDPOINT;
	const apiKey = process.env.CUSTOM_ANALYTICS_API_KEY;
	
	if (!endpoint || !apiKey) {
		return;
	}

	try {
		await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				events,
				user_id: userId,
				timestamp: Date.now()
			})
		});
	} catch (error) {
		console.warn('Failed to send to custom analytics:', error);
	}
}