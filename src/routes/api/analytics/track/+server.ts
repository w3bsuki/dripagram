import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { analyticsTrackRequestSchema, validateRequest } from '$lib/schemas/api';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	try {
		const body = await request.json();
		
		// Validate request body
		const validation = validateRequest(analyticsTrackRequestSchema, body);
		if (!validation.success) {
			return json({ error: validation.error }, { status: 400 });
		}
		
		const validatedData = validation.data;
		
		// Process validated batch events
		const results = await Promise.all(
			validatedData.events.map((event) => 
				processEvent(
					event.event_name, 
					event.properties || {}, 
					{ user_id: validatedData.user_id, session_id: validatedData.session_id }, 
					validatedData.client_timestamp || event.timestamp, 
					locals, 
					getClientAddress()
				)
			)
		);
		return json({ success: true, processed: results.length });
	} catch (error) {
		console.error('Analytics track error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

async function processEvent(eventName: string, properties: any, userProperties: any, client_timestamp: any, locals: any, getClientAddress: any) {
	const { session } = await locals.safeGetSession();
	const userId = session?.user?.id || null;
	const ipAddress = getClientAddress();
	
	// Check if user has given analytics consent
	let consentQuery = locals.supabase
		.from('user_consent')
		.select('analytics_consent');
	
	if (userId) {
		consentQuery = consentQuery.eq('user_id', userId);
	} else {
		consentQuery = consentQuery.eq('ip_address', ipAddress);
	}
	
	const { data: consentData } = await consentQuery
		.order('created_at', { ascending: false })
		.limit(1)
		.single();
	
	if (!consentData?.analytics_consent) {
		throw new Error('Analytics consent required');
	}
	
	// Save to our analytics_events table
	const { error } = await locals.supabase
		.from('analytics_events')
		.insert({
			user_id: userId,
			event_name: eventName,
			event_properties: properties,
			user_properties: {
				...userProperties,
				authenticated: !!userId
			},
			ip_address: ipAddress,
			user_agent: 'batch-request', // Since we don't have access to request in batch processing
			referrer: properties.referrer || null,
			url: properties.url || null,
			client_timestamp: client_timestamp ? new Date(client_timestamp) : null,
			consent_given: true
		});
		
	if (error) {
		console.error('Error saving analytics event:', error);
		throw new Error('Failed to track event');
	}
	
	return { 
		success: true, 
		message: 'Event tracked successfully',
		eventName,
		userId,
		consent: true
	};
}