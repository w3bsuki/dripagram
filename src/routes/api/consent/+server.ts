import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Consent validation schema
const consentSchema = z.object({
	consent: z.object({
		analytics: z.boolean().optional(),
		marketing: z.boolean().optional(),
		necessary: z.boolean().optional()
	}),
	userAgent: z.string().optional(),
	fingerprint: z.string().optional()
});

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	try {
		const body = await request.json();
		
		// Validate request body
		const validation = consentSchema.safeParse(body);
		if (!validation.success) {
			return json({ 
				error: 'Invalid request data', 
				details: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
			}, { status: 400 });
		}
		
		const { consent, userAgent, fingerprint } = validation.data;
		
		// Get user info
		const { session } = await locals.safeGetSession();
		const userId = session?.user?.id || null;
		const ipAddress = getClientAddress();
		
		// Save consent to database
		const { error } = await locals.supabase
			.from('user_consent')
			.upsert({
				user_id: userId,
				ip_address: ipAddress,
				consent_data: consent,
				analytics_consent: consent.analytics || false,
				marketing_consent: consent.marketing || false,
				necessary_consent: true,
				user_agent: userAgent,
				browser_fingerprint: fingerprint,
				updated_at: new Date().toISOString(),
			}, {
				onConflict: userId ? 'user_id' : 'ip_address'
			});
			
		if (error) {
			console.error('Error saving consent:', error);
			return json({ error: 'Failed to save consent' }, { status: 500 });
		}
		
		// If analytics consent is given, log a test event
		if (consent.analytics && locals.supabase) {
			await locals.supabase
				.from('analytics_events')
				.insert({
					user_id: userId,
					event_name: 'consent_given',
					event_properties: {
						consent_types: Object.keys(consent).filter(key => {
							const consentTyped = consent as Record<string, boolean | undefined>;
							return consentTyped[key];
						}),
						source: 'consent_banner'
					},
					user_properties: {
						user_agent: userAgent,
						authenticated: !!userId
					},
					ip_address: ipAddress,
					user_agent: userAgent,
					url: request.headers.get('referer') || '',
					consent_given: true
				});
		}
		
		return json({ success: true });
	} catch (error) {
		console.error('Consent API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ locals, getClientAddress }) => {
	try {
		const { session } = await locals.safeGetSession();
		const userId = session?.user?.id || null;
		const ipAddress = getClientAddress();
		
		// Get existing consent
		let consentQuery = locals.supabase
			.from('user_consent')
			.select('*');
		
		if (userId) {
			consentQuery = consentQuery.eq('user_id', userId);
		} else {
			consentQuery = consentQuery.eq('ip_address', ipAddress);
		}
		
		const { data, error } = await consentQuery
			.order('created_at', { ascending: false })
			.limit(1)
			.single();
			
		if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
			console.error('Error fetching consent:', error);
			return json({ error: 'Failed to fetch consent' }, { status: 500 });
		}
		
		return json({ 
			consent: data ? {
				analytics: data.analytics_consent,
				marketing: data.marketing_consent,
				necessary: data.necessary_consent,
				timestamp: data.updated_at
			} : null
		});
	} catch (error) {
		console.error('Consent GET error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};