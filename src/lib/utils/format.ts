/**
 * Format currency values
 */
export function formatCurrency(value: number, currency = 'BGN'): string {
	return new Intl.NumberFormat('bg-BG', {
		style: 'currency',
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/**
 * Format numbers with locale
 */
export function formatNumber(value: number): string {
	if (value < 1000) return value.toString();
	if (value < 1000000) return `${(value / 1000).toFixed(1)}k`;
	return `${(value / 1000000).toFixed(1)}m`;
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('bg-BG').format(d);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date | string): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffInMs = now.getTime() - d.getTime();
	const diffInMins = Math.floor(diffInMs / 60000);
	
	if (diffInMins < 1) return 'now';
	if (diffInMins < 60) return `${diffInMins}m`;
	if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}h`;
	return `${Math.floor(diffInMins / 1440)}d`;
}