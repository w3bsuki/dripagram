import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string({ required_error: 'Email is required' })
		.min(1, 'Email is required')
		.email('Invalid email address'),
	password: z.string({ required_error: 'Password is required' })
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password must be less than 100 characters')
});

export const signupSchema = z.object({
	email: z.string({ required_error: 'Email is required' })
		.min(1, 'Email is required')
		.email('Invalid email address'),
	password: z.string({ required_error: 'Password is required' })
		.min(6, 'Password must be at least 6 characters')
		.max(100, 'Password must be less than 100 characters'),
	confirmPassword: z.string({ required_error: 'Password confirmation is required' })
		.min(6, 'Password must be at least 6 characters'),
	fullName: z.string({ required_error: 'Full name is required' })
		.min(2, 'Full name must be at least 2 characters')
		.max(100, 'Full name must be less than 100 characters')
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});

export type LoginSchema = typeof loginSchema;
export type SignupSchema = typeof signupSchema;