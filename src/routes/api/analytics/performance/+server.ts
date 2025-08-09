import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createSupabaseServerClient } from '$lib/supabase/server';
import { z } from 'zod';

// Schema for performance metric data
const performanceMetricSchema = z.object({
	metric: z.object({
		name: z.string(),
		value: z.number(),
		rating: z.enum(['good', 'needs-improvement', 'poor']),
		timestamp: z.number(),
		navigationId: z.string().optional(),
		url: z.string().optional()
	}),
	timestamp: z.number(),
	userAgent: z.string().optional(),
	viewport: z.object({
		width: z.number(),
		height: z.number()
	}).optional(),
	connection: z.object({
		effectiveType: z.string().optional(),
		downlink: z.number().optional(),
		rtt: z.number().optional()
	}).optional()
});

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	try {
		const requestBody = await request.json();
		
		// Validate request body
		const validation = performanceMetricSchema.safeParse(requestBody);
		if (!validation.success) {
			return json({ 
				error: 'Invalid performance metric format',
				details: validation.error.errors 
			}, { status: 400 });
		}

		const { metric, timestamp, userAgent, viewport, connection } = validation.data;

		// Get user info from session if available
		const supabase = createSupabaseServerClient(cookies);
		const { data: { session } } = await supabase.auth.getSession();

		// Store performance metric in database
		const performanceData = {
			metric_name: metric.name,
			metric_value: metric.value,
			rating: metric.rating,
			navigation_id: metric.navigationId,
			page_url: metric.url,
			user_id: session?.user?.id || null,
			user_agent: userAgent,
			viewport_width: viewport?.width,
			viewport_height: viewport?.height,
			connection_type: connection?.effectiveType,
			connection_downlink: connection?.downlink,
			connection_rtt: connection?.rtt,
			client_timestamp: new Date(metric.timestamp),
			server_timestamp: new Date(timestamp),
			ip_address: getClientAddress(),
			created_at: new Date().toISOString()
		};

		const { error: insertError } = await supabase
			.from('performance_metrics')
			.insert(performanceData);

		if (insertError) {
			console.error('Performance metrics storage error:', insertError);
			return json({ error: 'Failed to store performance metric' }, { status: 500 });
		}

		// Track Core Web Vitals specifically for alerting
		if (['lcp', 'fid', 'cls', 'fcp', 'ttfb', 'inp'].includes(metric.name)) {
			await trackCoreWebVital(supabase, metric, session?.user?.id);
		}

		// Check for performance regressions
		if (metric.rating === 'poor') {
			await alertPerformanceRegression(metric, performanceData);
		}

		return json({ 
			success: true,
			metric: metric.name,
			rating: metric.rating
		});

	} catch (error) {
		console.error('Performance analytics API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

/**
 * Track Core Web Vitals in aggregate table for dashboard
 */
async function trackCoreWebVital(supabase: any, metric: any, userId?: string) {
	try {
		// Update or insert daily aggregate
		const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
		
		const { data: existing, error: selectError } = await supabase
			.from('core_web_vitals_daily')
			.select('*')
			.eq('date', today)
			.eq('metric_name', metric.name)
			.single();

		if (selectError && selectError.code !== 'PGRST116') { // Not found error
			console.error('Error checking existing CWV record:', selectError);
			return;
		}

		if (existing) {
			// Update existing record
			const newCount = existing.sample_count + 1;
			const newSum = existing.value_sum + metric.value;
			const newAverage = newSum / newCount;

			await supabase
				.from('core_web_vitals_daily')
				.update({
					value_sum: newSum,
					value_avg: newAverage,
					value_min: Math.min(existing.value_min, metric.value),
					value_max: Math.max(existing.value_max, metric.value),
					sample_count: newCount,
					good_count: existing.good_count + (metric.rating === 'good' ? 1 : 0),
					needs_improvement_count: existing.needs_improvement_count + (metric.rating === 'needs-improvement' ? 1 : 0),
					poor_count: existing.poor_count + (metric.rating === 'poor' ? 1 : 0),
					updated_at: new Date().toISOString()
				})
				.eq('id', existing.id);
		} else {
			// Insert new record
			await supabase
				.from('core_web_vitals_daily')
				.insert({
					date: today,
					metric_name: metric.name,
					value_sum: metric.value,
					value_avg: metric.value,
					value_min: metric.value,
					value_max: metric.value,
					sample_count: 1,
					good_count: metric.rating === 'good' ? 1 : 0,
					needs_improvement_count: metric.rating === 'needs-improvement' ? 1 : 0,
					poor_count: metric.rating === 'poor' ? 1 : 0,
					created_at: new Date().toISOString()
				});
		}
	} catch (error) {
		console.error('Error updating Core Web Vitals aggregate:', error);
	}
}

/**
 * Alert on performance regressions
 */
async function alertPerformanceRegression(metric: any, data: any) {
	try {
		// Only alert on critical metrics with poor performance
		const criticalMetrics = ['lcp', 'cls', 'fcp', 'ttfb'];
		if (!criticalMetrics.includes(metric.name)) {
			return;
		}

		// Log as warning for monitoring systems to pick up
		console.warn('Performance regression detected:', {
			metric: metric.name,
			value: metric.value,
			rating: metric.rating,
			url: metric.url,
			timestamp: metric.timestamp,
			userAgent: data.user_agent,
			viewport: `${data.viewport_width}x${data.viewport_height}`,
			connection: data.connection_type
		});

		// Could integrate with external alerting (Slack, PagerDuty, etc.)
		// await sendSlackAlert(`Performance regression: ${metric.name} = ${metric.value}ms on ${metric.url}`);
	} catch (error) {
		console.error('Error sending performance alert:', error);
	}
}