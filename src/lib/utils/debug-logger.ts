/**
 * Debug logging utilities for development
 */

export interface LogData {
	component?: string;
	data?: any;
	timestamp?: string;
}

class DebugLogger {
	private isDevelopment = typeof window !== 'undefined' && 
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	private formatMessage(level: string, message: string, data?: LogData): string {
		const timestamp = new Date().toISOString();
		const component = data?.component ? `[${data.component}]` : '';
		return `${timestamp} ${level} ${component} ${message}`;
	}

	log(message: string, data?: LogData): void {
		if (!this.isDevelopment) return;
		
		console.log(this.formatMessage('LOG', message, data), data?.data || '');
	}

	warn(message: string, data?: LogData): void {
		if (!this.isDevelopment) return;
		
		console.warn(this.formatMessage('WARN', message, data), data?.data || '');
	}

	error(message: string, data?: LogData): void {
		if (!this.isDevelopment) return;
		
		console.error(this.formatMessage('ERROR', message, data), data?.data || '');
	}

	info(message: string, data?: LogData): void {
		if (!this.isDevelopment) return;
		
		console.info(this.formatMessage('INFO', message, data), data?.data || '');
	}

	debug(message: string, data?: LogData): void {
		if (!this.isDevelopment) return;
		
		console.debug(this.formatMessage('DEBUG', message, data), data?.data || '');
	}
}

export const debug = new DebugLogger();