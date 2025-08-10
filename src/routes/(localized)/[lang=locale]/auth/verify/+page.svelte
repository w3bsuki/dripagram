<script lang="ts">
	import { page } from '$app/stores';
	import { toast } from '$lib/utils/toast';
	import { CheckCircle, Mail, Loader2 } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	let { data } = $props();
	let resending = $state(false);
	let email = $state('');
	
	async function resendVerificationEmail() {
		if (!email) {
			toast.error('Please enter your email');
			return;
		}
		
		resending = true;
		
		try {
			const { error } = await data.supabase.auth.resend({
				type: 'signup',
				email: email
			});
			
			if (error) throw error;
			
			toast.success('Verification email sent! Please check your inbox.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to resend verification email');
		} finally {
			resending = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-8 shadow-lg">
			<!-- Pending Verification State -->
			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
						<Mail size={32} class="text-blue-600" />
					</div>
				</div>
				
				<h2 class="text-2xl font-bold text-gray-900">Verify Your Email</h2>
				<p class="mt-2 text-sm text-gray-600">
					We've sent a verification link to your email address. Please check your inbox and click the verification link to complete your registration.
				</p>
				
				{#if email}
					<p class="mt-2 font-medium text-gray-900">{email}</p>
				{/if}
				
				<div class="mt-6 space-y-4">
					<div class="rounded-lg bg-gray-50 p-4 text-left">
						<h3 class="text-sm font-medium text-gray-900">Didn't receive the email?</h3>
						<ul class="mt-2 space-y-1 text-xs text-gray-600">
							<li>• Check your spam or junk folder</li>
							<li>• Make sure you entered the correct email</li>
							<li>• Wait a few minutes and try again</li>
						</ul>
					</div>
					
					{#if !email}
						<div>
							<input
								type="email"
								bind:value={email}
								placeholder="Enter your email"
								class="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
						</div>
					{/if}
					
					<Button
						variant="outline"
						onclick={resendVerificationEmail}
						disabled={resending || !email}
						class="w-full"
					>
						{#if resending}
							<Loader2 size={16} class="mr-2 animate-spin" />
							Sending...
						{:else}
							Resend Verification Email
						{/if}
					</Button>
					
					<div class="pt-2">
						<a 
							href="/auth/login" 
							class="text-sm text-gray-600 hover:text-gray-900"
						>
							Back to Login
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>