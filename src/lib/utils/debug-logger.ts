/**
 * Production-safe logging utilities
 */

export interface LogData {
	component?: string;
	data?: any;
	timestamp?: string;
}

class DebugLogger {
	// All logging methods are no-ops in production
	log(message: string, data?: LogData): void {}
	warn(message: string, data?: LogData): void {}
	error(message: string, data?: LogData): void {}
	info(message: string, data?: LogData): void {}
	debug(message: string, data?: LogData): void {}
}

export const debug = new DebugLogger();
