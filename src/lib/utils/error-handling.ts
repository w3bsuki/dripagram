/**
 * Error handling utilities for consistent error management
 */

import { dev } from '$app/environment';

/**
 * Custom error types
 */
export class AppError extends Error {
	public readonly code: string;
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly details?: any;

	constructor(
		message: string,
		code: string = 'UNKNOWN_ERROR',
		statusCode: number = 500,
		isOperational: boolean = true,
		details?: any
	) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.details = details;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: any) {
		super(message, 'VALIDATION_ERROR', 400, true, details);
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string = 'Authentication required') {
		super(message, 'AUTHENTICATION_ERROR', 401, true);
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string = 'Insufficient permissions') {
		super(message, 'AUTHORIZATION_ERROR', 403, true);
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super(`${resource} not found`, 'NOT_FOUND', 404, true);
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 'CONFLICT', 409, true);
	}
}

export class RateLimitError extends AppError {
	constructor(message: string = 'Too many requests') {
		super(message, 'RATE_LIMIT', 429, true);
	}
}

export class NetworkError extends AppError {
	constructor(message: string = 'Network error occurred') {
		super(message, 'NETWORK_ERROR', 0, true);
	}
}

/**
 * Error message formatter
 */
export function formatErrorMessage(error: unknown): string {
	if (error instanceof AppError) {
		return error.message;
	}
	
	if (error instanceof Error) {
		return error.message;
	}
	
	if (typeof error === 'string') {
		return error;
	}
	
	return 'An unexpected error occurred';
}

/**
 * Get error message (alias for formatErrorMessage for backward compatibility)
 */
export function getErrorMessage(error: unknown): string {
	return formatErrorMessage(error);
}

/**
 * Get error details for logging
 */
export function getErrorDetails(error: unknown): Record<string, any> {
	if (error instanceof AppError) {
		return {
			message: error.message,
			code: error.code,
			statusCode: error.statusCode,
			details: error.details,
			stack: dev ? error.stack : undefined
		};
	}
	
	if (error instanceof Error) {
		return {
			message: error.message,
			name: error.name,
			stack: dev ? error.stack : undefined
		};
	}
	
	return {
		error: String(error)
	};
}

/**
 * Check if error is operational (expected)
 */
export function isOperationalError(error: unknown): boolean {
	if (error instanceof AppError) {
		return error.isOperational;
	}
	return false;
}

/**
 * Log error with appropriate level
 */
export function logError(error: unknown, context?: Record<string, any>): void {
	const details = getErrorDetails(error);
	const isOperational = isOperationalError(error);
	
	if (dev) {
		if (isOperational) {
			console.warn('[Operational Error]', details, context);
		} else {
			console.error('[System Error]', details, context);
		}
	}
	
	// In production, you would send to error tracking service
	// Example: Sentry.captureException(error, { extra: context });
}

/**
 * Handle async errors in route handlers
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T): T {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			logError(error);
			throw error;
		}
	}) as T;
}

/**
 * Retry failed operations with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options: {
		maxRetries?: number;
		initialDelay?: number;
		maxDelay?: number;
		factor?: number;
		onRetry?: (attempt: number, error: unknown) => void;
	} = {}
): Promise<T> {
	const {
		maxRetries = 3,
		initialDelay = 1000,
		maxDelay = 10000,
		factor = 2,
		onRetry
	} = options;
	
	let lastError: unknown;
	let delay = initialDelay;
	
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			
			if (attempt === maxRetries) {
				break;
			}
			
			onRetry?.(attempt, error);
			
			await new Promise(resolve => setTimeout(resolve, delay));
			delay = Math.min(delay * factor, maxDelay);
		}
	}
	
	throw lastError;
}

/**
 * Create error response for API routes
 */
export function createErrorResponse(error: unknown): Response {
	const details = getErrorDetails(error);
	const statusCode = error instanceof AppError ? error.statusCode : 500;
	
	return new Response(
		JSON.stringify({
			error: {
				message: formatErrorMessage(error),
				...details
			}
		}),
		{
			status: statusCode,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
}

/**
 * Parse error from API response
 */
export async function parseApiError(response: Response): Promise<AppError> {
	try {
		const data = await response.json();
		const message = data.error?.message || data.message || 'Request failed';
		const code = data.error?.code || 'API_ERROR';
		
		return new AppError(message, code, response.status);
	} catch {
		return new AppError(
			`Request failed with status ${response.status}`,
			'API_ERROR',
			response.status
		);
	}
}

/**
 * Validate required fields
 */
export function validateRequired<T extends Record<string, any>>(
	data: T,
	fields: (keyof T)[]
): void {
	const missing = fields.filter(field => !data[field]);
	
	if (missing.length > 0) {
		throw new ValidationError(
			`Missing required fields: ${missing.join(', ')}`,
			{ missing }
		);
	}
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T = any>(json: string, fallback?: T): T | undefined {
	try {
		return JSON.parse(json);
	} catch (error) {
		logError(error, { json: json.substring(0, 100) });
		return fallback;
	}
}

/**
 * Timeout promise wrapper
 */
export function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	errorMessage: string = 'Operation timed out'
): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(() => reject(new AppError(errorMessage, 'TIMEOUT', 408)), timeoutMs)
		)
	]);
}