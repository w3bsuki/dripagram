<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '$lib/utils/toast';
	import { Eye, EyeOff, Mail, Lock, User, Building2, UserCircle, AtSign } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let email = $state(form?.email || '');
	let password = $state('');
	let fullName = $state(form?.fullName || '');
	let username = $state(form?.username || '');
	let accountType = $state<'personal' | 'brand'>(form?.accountType || 'personal');
	let brandName = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let acceptTerms = $state(false);

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});

	function selectAccountType(type: 'personal' | 'brand') {
		accountType = type;
		if (type === 'personal') {
			brandName = '';
		}
	}
</script>

<div class="auth-container">
	<div class="auth-card">
		<!-- Logo -->
		<a href="/" class="logo">driplo</a>

		<!-- Header -->
		<div class="auth-header">
			<h1>Create your account</h1>
			<p>Join Bulgaria's #1 fashion marketplace</p>
		</div>

		<!-- Form -->
		<form 
			method="POST" 
			class="auth-form"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					loading = false;
					if (result.type === 'redirect') {
						toast.success('Account created! Please check your email to verify.');
					}
					await update();
				};
			}}
		>
			<!-- Account Type Selection -->
			<fieldset class="form-group">
				<legend>Choose your account type</legend>
				<div class="account-type-cards">
					<button
						type="button"
						onclick={() => selectAccountType('personal')}
						class="account-card {accountType === 'personal' ? 'selected' : ''}"
					>
						<UserCircle size={32} class="account-icon" />
						<div class="account-info">
							<h3>Personal</h3>
							<p>Buy and sell your own items</p>
						</div>
					</button>

					<button
						type="button"
						onclick={() => selectAccountType('brand')}
						class="account-card {accountType === 'brand' ? 'selected' : ''}"
					>
						<Building2 size={32} class="account-icon" />
						<div class="account-info">
							<h3>Brand</h3>
							<p>Sell as a business or brand</p>
						</div>
					</button>
				</div>
				<!-- Hidden input for account type -->
				<input type="hidden" name="accountType" value={accountType} />
			</fieldset>

			<!-- Brand Name Field (conditional) -->
			{#if accountType === 'brand'}
				<div class="form-group brand-field">
					<label for="brandName">Brand Name</label>
					<div class="input-wrapper">
						<Building2 size={20} class="input-icon" />
						<input
							id="brandName"
							type="text"
							name="brandName"
							value={brandName}
							oninput={(e) => brandName = e.currentTarget.value}
							placeholder="Your Brand Name"
							required
							class="input-field"
							disabled={loading}
						/>
					</div>
				</div>
			{/if}

			<div class="form-group">
				<label for="fullName">Full Name</label>
				<div class="input-wrapper">
					<User size={20} class="input-icon" />
					<input
						id="fullName"
						type="text"
						name="fullName"
						value={fullName}
						oninput={(e) => fullName = e.currentTarget.value}
						placeholder="John Doe"
						required
						class="input-field"
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="username">Username</label>
				<div class="input-wrapper">
					<AtSign size={20} class="input-icon" />
					<input
						id="username"
						type="text"
						name="username"
						value={username}
						oninput={(e) => username = e.currentTarget.value}
						placeholder="johndoe"
						required
						pattern="[a-zA-Z0-9_]+"
						title="Username can only contain letters, numbers, and underscores"
						class="input-field"
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<div class="input-wrapper">
					<Mail size={20} class="input-icon" />
					<input
						id="email"
						type="email"
						name="email"
						value={email}
						oninput={(e) => email = e.currentTarget.value}
						placeholder="you@example.com"
						required
						class="input-field"
						disabled={loading}
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<div class="input-wrapper">
					<Lock size={20} class="input-icon" />
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						name="password"
						value={password}
						oninput={(e) => password = e.currentTarget.value}
						placeholder="••••••••"
						required
						minlength="8"
						class="input-field"
						disabled={loading}
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="toggle-password"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}
							<EyeOff size={20} />
						{:else}
							<Eye size={20} />
						{/if}
					</button>
				</div>
				<p class="helper-text">Must be at least 8 characters</p>
			</div>

			<div class="form-group checkbox-group">
				<label class="checkbox-label">
					<input 
						type="checkbox" 
						name="acceptTerms"
						checked={acceptTerms}
						onchange={(e) => acceptTerms = e.currentTarget.checked}
						required 
						class="checkbox"
						disabled={loading}
					/>
					<span>
						I agree to the <a href="/terms" class="link">Terms of Service</a> and
						<a href="/privacy" class="link">Privacy Policy</a>
					</span>
				</label>
			</div>

			<button type="submit" class="submit-btn" disabled={loading}>
				{loading ? 'Creating account...' : 'Create account'}
			</button>
		</form>

		<!-- Divider -->
		<div class="divider">
			<span>or continue with</span>
		</div>

		<!-- Social Buttons -->
		<div class="social-buttons">
			<button class="social-btn google" aria-label="Sign up with Google" disabled>
				<svg viewBox="0 0 24 24" width="20" height="20">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Google
			</button>

			<button class="social-btn facebook" aria-label="Sign up with Facebook" disabled>
				<svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
					<path
						d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
					/>
				</svg>
				Facebook
			</button>
		</div>

		<!-- Footer -->
		<div class="auth-footer">
			Already have an account?
			<a href="/auth/login" class="link">Sign in</a>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		background: var(--color-gray-50);
	}

	.auth-card {
		width: 100%;
		max-width: 440px;
		background: var(--color-background);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.logo {
		display: block;
		font-size: 2rem;
		font-weight: 800;
		background: linear-gradient(135deg, var(--color-primary), #6c63ff);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-decoration: none;
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.auth-header h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.auth-header p {
		color: var(--color-text-secondary);
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.account-type-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.account-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1.5rem 1rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s;
		text-align: center;
	}

	.account-card:hover {
		border-color: var(--color-primary);
		background: var(--color-gray-50);
	}

	.account-card.selected {
		border-color: var(--color-primary);
		background: rgba(24, 119, 242, 0.05);
	}

	:global(.account-card .account-icon) {
		color: var(--color-text-secondary);
		margin-bottom: 0.75rem;
		transition: color 0.2s;
	}

	:global(.account-card.selected .account-icon) {
		color: var(--color-primary);
	}

	.account-info h3 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.account-info p {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	:global(.input-wrapper .input-icon) {
		position: absolute;
		left: 1rem;
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.input-field {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 3rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--color-text-primary);
		transition: all 0.2s;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
	}

	.input-field:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.toggle-password {
		position: absolute;
		right: 1rem;
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.toggle-password:hover {
		color: var(--color-text-secondary);
	}

	.helper-text {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: -0.25rem;
	}

	.checkbox-group {
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox {
		margin-top: 0.125rem;
		cursor: pointer;
	}

	.checkbox-label span {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.link {
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.link:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem;
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: 0.5rem;
	}

	.submit-btn:hover:not(:disabled) {
		background: #1567d8;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.divider {
		text-align: center;
		margin: 1.5rem 0;
		position: relative;
	}

	.divider span {
		background: var(--color-background);
		padding: 0 1rem;
		color: var(--color-text-muted);
		font-size: 0.875rem;
		position: relative;
		z-index: var(--z-behind);
	}

	.divider::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-border);
	}

	.social-buttons {
		display: flex;
		gap: 1rem;
	}

	.social-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.social-btn:hover:not(:disabled) {
		background: var(--color-gray-50);
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.social-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.auth-footer {
		text-align: center;
		margin-top: 2rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.brand-field {
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 640px) {
		.auth-card {
			padding: 1.5rem;
		}

		.account-type-cards {
			grid-template-columns: 1fr;
		}

		:global(.account-card .account-icon) {
			margin-bottom: 0;
		}

		.account-card {
			flex-direction: row;
			justify-content: flex-start;
			text-align: left;
			padding: 1rem;
		}

		.social-buttons {
			flex-direction: column;
		}
	}
</style>