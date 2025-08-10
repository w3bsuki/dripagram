/**
 * API Constants
 * Centralized configuration for HTTP status codes and error messages
 */

// HTTP Status Codes
export const HTTP_STATUS = {
	// Success
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	
	// Redirection
	MOVED_PERMANENTLY: 301,
	FOUND: 302,
	NOT_MODIFIED: 304,
	
	// Client errors
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	TOO_MANY_REQUESTS: 429,
	
	// Server errors
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
	// Authentication
	UNAUTHORIZED: 'Authentication required',
	SESSION_EXPIRED: 'Your session has expired. Please log in again',
	INVALID_CREDENTIALS: 'Invalid email or password',
	
	// Authorization
	FORBIDDEN: 'You do not have permission to perform this action',
	INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
	
	// Rate limiting
	RATE_LIMIT: 'Rate limit exceeded. Please try again later',
	TOO_MANY_REQUESTS: 'Too many requests. Please slow down',
	
	// Validation
	INVALID_REQUEST: 'Invalid request data',
	MISSING_REQUIRED_FIELDS: 'Required fields are missing',
	INVALID_INPUT: 'Invalid input provided',
	VALIDATION_FAILED: 'Validation failed',
	
	// Resource errors
	NOT_FOUND: 'Resource not found',
	ALREADY_EXISTS: 'Resource already exists',
	CONFLICT: 'Resource conflict',
	
	// Server errors
	INTERNAL_ERROR: 'An unexpected error occurred',
	SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
	DATABASE_ERROR: 'Database operation failed',
	
	// Business logic
	INSUFFICIENT_FUNDS: 'Insufficient funds',
	ITEM_UNAVAILABLE: 'Item is no longer available',
	OPERATION_FAILED: 'Operation failed. Please try again',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
	CREATED: 'Successfully created',
	UPDATED: 'Successfully updated',
	DELETED: 'Successfully deleted',
	SAVED: 'Successfully saved',
	SENT: 'Successfully sent',
	UPLOADED: 'Successfully uploaded',
} as const;

// API Limits
export const API_LIMITS = {
	PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100,
	MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
	MAX_BATCH_SIZE: 50,
	MAX_SEARCH_RESULTS: 500,
	RATE_LIMIT_REQUESTS: 100,
	RATE_LIMIT_WINDOW: 60000, // 1 minute in ms
} as const;

// API Headers
export const API_HEADERS = {
	CONTENT_TYPE: 'Content-Type',
	AUTHORIZATION: 'Authorization',
	X_REQUEST_ID: 'X-Request-ID',
	X_RATE_LIMIT: 'X-RateLimit-Limit',
	X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
	X_RATE_LIMIT_RESET: 'X-RateLimit-Reset',
} as const;

// Content Types
export const CONTENT_TYPES = {
	JSON: 'application/json',
	FORM_DATA: 'multipart/form-data',
	URL_ENCODED: 'application/x-www-form-urlencoded',
	TEXT: 'text/plain',
	HTML: 'text/html',
} as const;

/**
 * Helper function to create standardized error response
 */
export function createErrorResponse(
	message: string = ERROR_MESSAGES.INTERNAL_ERROR,
	status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
	details?: unknown
) {
	return {
		error: {
			message,
			status,
			timestamp: new Date().toISOString(),
			...(details && typeof details === 'object' ? { details } : {}),
		},
	};
}

/**
 * Helper function to create standardized success response
 */
export function createSuccessResponse<T = unknown>(
	data: T,
	message?: string,
	meta?: Record<string, unknown>
) {
	return {
		success: true,
		...(message && { message }),
		data,
		...(meta && { meta }),
	};
}

// Type guards
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ErrorMessage = (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = (typeof SUCCESS_MESSAGES)[keyof typeof SUCCESS_MESSAGES];
export type ApiLimit = (typeof API_LIMITS)[keyof typeof API_LIMITS];