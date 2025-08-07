<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '$lib/schemas/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
		id: 'login',
		resetForm: false,
		taintedMessage: null,
		delayMs: 0,
		timeoutMs: 8000,
		dataType: 'form',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Force a full page reload to ensure cookies are set
				window.location.href = result.location;
			}
		}
	});

	// Cast the form stores for better type safety
	const typedForm = form as any;
	const typedErrors = errors as any;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="max-w-md w-full space-y-8 p-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold">Welcome back</h2>
			<p class="text-gray-600 mt-2">Sign in to your account</p>
		</div>

		<form method="POST" use:enhance class="space-y-6">
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input 
					id="email"
					name="email" 
					type="email"
					bind:value={$typedForm.email}
					class={$typedErrors.email ? 'border-red-500' : ''}
				/>
				{#if $typedErrors.email}
					<p class="text-sm text-red-500">{$typedErrors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password">Password</Label>
				<Input 
					id="password"
					name="password"
					type="password" 
					bind:value={$typedForm.password}
					class={$typedErrors.password ? 'border-red-500' : ''}
				/>
				{#if $typedErrors.password}
					<p class="text-sm text-red-500">{$typedErrors.password}</p>
				{/if}
			</div>

			{#if $message}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">{$message}</p>
				</div>
			{/if}
			
			<Button type="submit" class="w-full">
				Sign in
			</Button>
		</form>

		<p class="text-center text-sm">
			Don't have an account? 
			<a href="/auth/signup" class="text-blue-600 hover:underline">Sign up</a>
		</p>
	</div>
</div>