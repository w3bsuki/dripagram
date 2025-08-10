<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { signupSchema } from '$lib/schemas/auth';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Loader2 } from '@lucide/svelte';
	import AnimatedLogo from '$lib/components/branding/AnimatedLogo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	const { form, errors, enhance, submitting, message } = superForm(data.form, {
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
	<title>Sign Up - Driplo</title>
	<meta name="description" content="Create your Driplo account - Bulgaria's favorite fashion marketplace" />
</svelte:head>

<div class="fixed inset-0 bg-background flex items-center justify-center">
	<div class="w-full max-w-sm bg-card rounded-lg border border-border shadow-sm p-4">
		<!-- Logo -->
		<a href="/" class="flex items-center justify-center gap-2 mb-4 text-foreground no-underline font-bold">
			<AnimatedLogo size="medium" showText={true} />
		</a>

		<!-- Header -->
		<div class="text-center mb-4">
			<div class="w-10 h-10 bg-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-background">
				<User class="w-5 h-5" />
			</div>
			<h1 class="text-lg font-semibold text-foreground mb-1">Create your account</h1>
			<p class="text-sm text-muted-foreground">Join Bulgaria's #1 fashion marketplace</p>
		</div>

		<!-- Form -->
		<form method="POST" use:enhance class="space-y-3 mb-3">
			<div class="space-y-1.5">
				<Label for="fullName" class="text-xs font-medium">Full Name</Label>
				<div class="relative">
					<User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="fullName"
						name="fullName"
						type="text"
						placeholder="John Doe"
						bind:value={$form.fullName}
						class="pl-10 h-10 text-sm {$errors.fullName ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="name"
						required
					/>
				</div>
				{#if $errors.fullName}
					<p class="text-xs text-destructive flex items-center gap-1">
						<AlertCircle class="h-3 w-3" />
						{$errors.fullName}
					</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<Label for="email" class="text-xs font-medium">Email address</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="you@example.com"
						bind:value={$form.email}
						class="pl-10 h-10 text-sm {$errors.email ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="email"
						required
					/>
				</div>
				{#if $errors.email}
					<p class="text-xs text-destructive flex items-center gap-1">
						<AlertCircle class="h-3 w-3" />
						{$errors.email}
					</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<Label for="password" class="text-xs font-medium">Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Create a strong password"
						bind:value={$form.password}
						class="pl-10 pr-10 h-10 text-sm {$errors.password ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="new-password"
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
					<p class="text-xs text-destructive flex items-center gap-1">
						<AlertCircle class="h-3 w-3" />
						{$errors.password}
					</p>
				{/if}
			</div>

			<div class="space-y-1.5">
				<Label for="confirmPassword" class="text-xs font-medium">Confirm Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						placeholder="Confirm your password"
						bind:value={$form.confirmPassword}
						class="pl-10 pr-10 h-10 text-sm {$errors.confirmPassword ? 'border-destructive focus:ring-destructive' : ''}"
						disabled={$submitting}
						autocomplete="new-password"
						required
					/>
					<button
						type="button"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
						aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
					>
						{#if showConfirmPassword}
							<EyeOff class="h-4 w-4" />
						{:else}
							<Eye class="h-4 w-4" />
						{/if}
					</button>
				</div>
				{#if $errors.confirmPassword}
					<p class="text-xs text-destructive flex items-center gap-1">
						<AlertCircle class="h-3 w-3" />
						{$errors.confirmPassword}
					</p>
				{/if}
			</div>

			{#if $message}
				<Alert variant="destructive" class="py-2">
					<AlertCircle class="h-3 w-3" />
					<AlertDescription class="text-xs">{$message}</AlertDescription>
				</Alert>
			{/if}

			<Button 
				type="submit" 
				class="w-full h-10 text-sm font-medium"
				disabled={$submitting}
			>
				{#if $submitting}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Creating account...
				{:else}
					Create account
				{/if}
			</Button>
		</form>

		<!-- Sign in link -->
		<div class="text-center text-xs pt-3 border-t border-border">
			<p class="text-muted-foreground">Already have an account? <a href="/auth/login" class="text-foreground underline font-medium hover:opacity-70 transition-opacity">Sign in</a></p>
		</div>
	</div>
</div>

<style>
	@media (max-width: 640px) {
		.fixed {
			padding: 0.75rem;
		}
		
		.max-w-sm {
			max-width: 100%;
			padding: 0.75rem;
			border: none;
			box-shadow: none;
			border-radius: 0;
		}
		
		.space-y-3 > * + * {
			margin-top: 0.5rem !important;
		}
	}
</style>