<script lang="ts">
	import { createClient } from '$lib/supabase/client';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { browser } from '$app/environment';

	const supabase = createClient();
	import { toast } from '$lib/utils/toast';
	import { Mail, ArrowLeft } from '@lucide/svelte';
	import Button from '$lib/components/native/Button.svelte';
	
	let email = $state('');
	let loading = $state(false);
	let submitted = $state(false);
	
	async function handlePasswordReset() {
		if (!email) {
			toast.error('Please enter your email');
			return;
		}
		
		loading = true;
		
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${PUBLIC_SITE_URL || (browser ? window.location.origin : 'https://driplo.bg')}/bg/auth/confirm?type=recovery`
			});
			
			if (error) throw error;
			
			submitted = true;
			toast.success('Password reset link sent to your email');
		} catch (error: any) {
			toast.error(error.message || 'Failed to send reset email');
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-8 shadow-lg">
			{#if !submitted}
				<div class="mb-8 text-center">
					<h1 class="text-3xl font-bold text-gray-900">Forgot Password?</h1>
					<p class="mt-2 text-sm text-gray-600">
						No worries! Enter your email and we'll send you reset instructions.
					</p>
				</div>
				
				<form onsubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} class="space-y-6">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">
							Email Address
						</label>
						<div class="relative mt-1">
							<Mail size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								id="email"
								type="email"
								bind:value={email}
								placeholder="Enter your email"
								required
								disabled={loading}
								class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
						</div>
					</div>
					
					<Button
						type="submit"
						variant="default"
						size="lg"
						class="w-full"
						disabled={loading}
					>
						{loading ? 'Sending...' : 'Send Reset Link'}
					</Button>
				</form>
				
				<div class="mt-6 text-center">
					<a href="/auth/login" class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
						<ArrowLeft size={16} />
						Back to Login
					</a>
				</div>
			{:else}
				<div class="text-center">
					<div class="mb-4 flex justify-center">
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<Mail size={32} class="text-green-600" />
						</div>
					</div>
					
					<h2 class="text-2xl font-bold text-gray-900">Check Your Email</h2>
					<p class="mt-2 text-sm text-gray-600">
						We've sent a password reset link to:
					</p>
					<p class="mt-1 font-medium text-gray-900">{email}</p>
					
					<div class="mt-6 space-y-3">
						<p class="text-xs text-gray-500">
							Didn't receive the email? Check your spam folder or
						</p>
						<Button
							variant="outline"
							size="sm"
							onclick={() => { submitted = false; email = ''; }}
						>
							Try Another Email
						</Button>
					</div>
					
					<div class="mt-8">
						<a href="/auth/login" class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
							<ArrowLeft size={16} />
							Back to Login
						</a>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>