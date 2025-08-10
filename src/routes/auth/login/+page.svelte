<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { loginSchema } from '$lib/schemas/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from '@lucide/svelte';
	import AnimatedLogo from '$lib/components/branding/AnimatedLogo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showPassword = $state(false);

	const { form, errors, enhance, submitting, message, delayed } = superForm(data.form, {
		resetForm: false,
		taintedMessage: null,
		delayMs: 500,
		timeoutMs: 8000,
		dataType: 'form',
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				window.location.href = result.location;
			}
		}
	});
</script>

<svelte:head>
	<title>Sign In - Driplo</title>
	<meta name="description" content="Sign in to Driplo - Bulgaria's favorite fashion marketplace" />
</svelte:head>

<div class="fixed inset-0 bg-background flex items-center justify-center">
	<div class="w-full max-w-sm bg-card rounded-lg border border-border shadow-sm p-4">
		<!-- Logo -->
		<a href="/" class="flex items-center justify-center gap-2 mb-6 text-foreground no-underline font-bold">
			<AnimatedLogo size="medium" showText={true} />
		</a>

		<!-- Header -->
		<div class="text-center mb-6">
			<div class="w-10 h-10 bg-foreground rounded-full flex items-center justify-center mx-auto mb-3 text-background">
				<Lock class="w-5 h-5" />
			</div>
			<h1 class="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
			<p class="text-sm text-muted-foreground">Sign in to continue to Driplo</p>
		</div>

		<!-- Form -->
		<form method="POST" use:enhance class="space-y-4 mb-4">
			<div class="space-y-2">
				<Label for="email" class="text-sm font-medium">Email address</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="you@example.com"
						bind:value={$form.email}
						class="pl-10 h-11 {$errors.email ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="email"
						required
					/>
				</div>
				{#if $errors.email}
					<p class="text-sm text-destructive flex items-center gap-1">
						<AlertCircle class="h-4 w-4" />
						{$errors.email}
					</p>
				{/if}
			</div>

			<div class="space-y-2">
				<Label for="password" class="text-sm font-medium">Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Enter your password"
						bind:value={$form.password}
						class="pl-10 pr-10 h-11 {$errors.password ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="current-password"
						required
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{#if $errors.password}
					<p class="text-sm text-destructive flex items-center gap-1">
						<AlertCircle class="h-4 w-4" />
						{$errors.password}
					</p>
				{/if}
			</div>

			{#if $message}
				<Alert variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<AlertDescription>{$message}</AlertDescription>
				</Alert>
			{/if}

			<Button 
				type="submit" 
				class="w-full h-11 text-sm font-medium"
				disabled={$submitting}
			>
				{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Signing in...
				{:else}
					Sign in
				{/if}
			</Button>
		</form>

		<!-- Sign up link -->
		<div class="text-center text-sm pt-4 border-t border-border">
			<p class="text-muted-foreground">Don't have an account? <a href="/auth/signup" class="text-foreground underline font-medium hover:opacity-70 transition-opacity">Sign up</a></p>
		</div>
	</div>
</div>

<style>
	@media (max-width: 640px) {
		.fixed {
			padding: 1rem;
		}
		
		.max-w-sm {
			max-width: 100%;
			padding: 1rem;
			border: none;
			box-shadow: none;
			border-radius: 0;
		}
	}
</style>