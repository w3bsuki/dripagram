<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/native/Button.svelte';
	import Input from '$lib/components/native/Input.svelte';
	import { Label } from '$lib/components/ui/label';
	import Alert from '$lib/components/native/Alert.svelte';
	import AlertDescription from '$lib/components/native/AlertDescription.svelte';
	import { Eye, EyeOff, User, Mail, Lock, AlertCircle, Loader2 } from '@lucide/svelte';
	import AnimatedLogo from '$lib/components/branding/AnimatedLogo.svelte';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let submitting = $state(false);

	// Get locale from URL params
	let locale = $derived($page.params.lang || 'bg');
</script>

<svelte:head>
	<title>{m['auth.sign_up_title']()}</title>
	<meta name="description" content={m['auth.sign_up_meta']()} />
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<!-- Logo -->
		<a href="/{locale}" class="auth-logo">
			<AnimatedLogo size="medium" showText={true} />
		</a>

		<!-- Header -->
		<div class="auth-header">
			<div class="auth-icon">
				<User size={20} />
			</div>
			<h1 class="auth-title">{m['auth.create_your_account']()}</h1>
			<p class="auth-subtitle">{m['auth.join_marketplace']()}</p>
		</div>

		<!-- Form -->
		<form method="POST" use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}} class="auth-form">
			<div class="form-group">
				<Label for="fullName" class="form-label">{m['auth.full_name']()}</Label>
				<div class="input-wrapper">
					<User class="input-icon" size={16} />
					<Input
						id="fullName"
						name="fullName"
						type="text"
						placeholder={m['auth.full_name_placeholder']()}
						class="form-input"
						disabled={submitting}
						autocomplete="name"
						required
					/>
				</div>
			</div>

			<div class="form-group">
				<Label for="email" class="form-label">{m['auth.email_label']()}</Label>
				<div class="input-wrapper">
					<Mail class="input-icon" size={16} />
					<Input
						id="email"
						name="email"
						type="email"
						placeholder={m['auth.email_placeholder']()}
						class="form-input"
						disabled={submitting}
						autocomplete="email"
						required
					/>
				</div>
			</div>

			<div class="form-group">
				<Label for="password" class="form-label">{m['auth.password_label']()}</Label>
				<div class="input-wrapper">
					<Lock class="input-icon" size={16} />
					<Input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						placeholder={m['auth.create_strong_password']()}
						class="form-input password-input"
						disabled={submitting}
						autocomplete="new-password"
						required
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="password-toggle"
						aria-label={showPassword ? m['auth.hide_password']() : m['auth.show_password']()}
					>
						{#if showPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
			</div>

			<div class="form-group">
				<Label for="confirmPassword" class="form-label">{m['auth.confirm_password']()}</Label>
				<div class="input-wrapper">
					<Lock class="input-icon" size={16} />
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						placeholder={m['auth.confirm_your_password']()}
						class="form-input password-input"
						disabled={submitting}
						autocomplete="new-password"
						required
					/>
					<button
						type="button"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
						class="password-toggle"
						aria-label={showConfirmPassword ? m['auth.hide_password']() : m['auth.show_password']()}
					>
						{#if showConfirmPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
			</div>

			{#if form?.error}
				<div class="alert-error">
					<AlertCircle size={16} />
					<span>{form.error}</span>
				</div>
			{/if}

			<Button 
				type="submit" 
				class="submit-button"
				disabled={submitting}
			>
				{#if submitting}
					<Loader2 class="spinner" size={16} />
					{m['auth.creating_account']()}
				{:else}
					{m['auth.create_account']()}
				{/if}
			</Button>
		</form>

		<!-- Sign in link -->
		<div class="auth-footer">
			<p class="footer-text">{m['auth.already_have_account']()} <a href="/{locale}/auth/login" class="footer-link">{m['auth.sign_in']()}</a></p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		position: fixed;
		inset: 0;
		background: var(--color-surface-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		min-height: 100vh;
	}

	.auth-card {
		width: 100%;
		max-width: 420px;
		background: white;
		border-radius: 16px;
		border: 1px solid var(--color-border-primary);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
		padding: 32px;
	}

	.auth-logo {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-bottom: 20px;
		text-decoration: none;
		color: var(--color-text-primary);
		font-weight: 600;
		transition: opacity 0.15s ease;
	}

	.auth-logo:hover {
		opacity: 0.8;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 28px;
	}

	.auth-icon {
		width: 48px;
		height: 48px;
		background: var(--color-interactive-primary);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16px;
		color: white;
	}

	.auth-title {
		font-size: 22px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 8px 0;
		line-height: 1.2;
	}

	.auth-subtitle {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.auth-form {
		margin-bottom: 24px;
	}

	.form-group {
		margin-bottom: 18px;
	}

	.form-label {
		display: block;
		font-size: 13px;
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: 6px;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 12px;
		color: var(--color-text-secondary);
		z-index: 1;
		pointer-events: none;
	}

	:global(.form-input) {
		width: 100%;
		height: 44px;
		padding: 0 16px 0 42px;
		background: var(--color-surface-primary);
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		font-size: 16px;
		color: var(--color-text-primary);
		transition: all 0.15s ease;
	}

	:global(.form-input:focus) {
		outline: none;
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	:global(.form-input.error) {
		border-color: var(--color-surface-error);
	}

	:global(.form-input.error:focus) {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	:global(.password-input) {
		padding-right: 46px;
	}

	.password-toggle {
		position: absolute;
		right: 12px;
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 8px;
		border-radius: 4px;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		min-height: 28px;
	}

	.password-toggle:hover {
		color: var(--color-text-primary);
		background: var(--color-surface-tertiary);
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--color-text-error);
		margin-top: 6px;
		margin: 6px 0 0 0;
	}

	.alert-error {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		background: var(--color-surface-error-light);
		border: 1px solid var(--color-border-error);
		border-radius: 8px;
		color: var(--color-text-error-dark);
		font-size: 13px;
		margin-bottom: 18px;
	}

	:global(.submit-button) {
		width: 100%;
		height: 44px;
		background: var(--color-interactive-primary);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	:global(.submit-button:hover:not(:disabled)) {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}

	:global(.submit-button:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	:global(.spinner) {
		animation: spin 1s linear infinite;
	}

	.auth-footer {
		text-align: center;
		padding-top: 20px;
		border-top: 1px solid var(--color-border-secondary);
	}

	.footer-text {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.footer-link {
		color: var(--color-interactive-primary);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.15s ease;
	}

	.footer-link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.auth-container {
			padding: 16px;
		}
		
		.auth-card {
			max-width: 100%;
			padding: 24px;
			border-radius: 12px;
		}

		.auth-title {
			font-size: 20px;
		}

		.form-group {
			margin-bottom: 16px;
		}

		:global(.form-input) {
			height: 48px;
			font-size: 16px;
		}

		:global(.submit-button) {
			height: 42px;
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>