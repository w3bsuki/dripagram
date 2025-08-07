<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createClient } from '$lib/supabase/client';

	const supabase = createClient();
	import { toast } from '$lib/utils/toast';
	import { Lock, Eye, EyeOff, Check } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let success = $state(false);
	
	// Password strength indicators
	let passwordStrength = $derived(() => {
		const checks = {
			length: password ? password.length >= 8 : false,
			uppercase: password ? /[A-Z]/.test(password) : false,
			lowercase: password ? /[a-z]/.test(password) : false,
			numbers: password ? /\d/.test(password) : false,
			special: password ? /[!@#$%^&*]/.test(password) : false
		};

		if (!password) return { score: 0, text: '', color: '', checks };
		
		const score = Object.values(checks).filter(Boolean).length;
		
		const strength: Record<number, { text: string; color: string }> = {
			0: { text: '', color: '' },
			1: { text: 'Very Weak', color: 'text-red-500' },
			2: { text: 'Weak', color: 'text-orange-500' },
			3: { text: 'Fair', color: 'text-yellow-500' },
			4: { text: 'Good', color: 'text-blue-500' },
			5: { text: 'Strong', color: 'text-green-500' }
		};
		
		return { score, ...strength[score], checks };
	});
	
	onMount(() => {
		// Check if we have a valid recovery token
		const hashParams = new URLSearchParams(window.location.hash.substring(1));
		const accessToken = hashParams.get('access_token');
		const type = hashParams.get('type');
		
		if (!accessToken || type !== 'recovery') {
			toast.error('Invalid or expired reset link');
			goto('/auth/forgot-password');
		}
	});
	
	async function handlePasswordReset() {
		if (!password || !confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}
		
		if (password !== confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		
		if (passwordStrength().score < 3) {
			toast.error('Please choose a stronger password');
			return;
		}
		
		loading = true;
		
		try {
			const { error } = await supabase.auth.updateUser({
				password: password
			});
			
			if (error) throw error;
			
			success = true;
			toast.success('Password updated successfully!');
			
			// Redirect to login after 2 seconds
			setTimeout(() => {
				goto('/auth/login');
			}, 2000);
		} catch (error: any) {
			console.error('Password update error:', error);
			toast.error(error.message || 'Failed to update password');
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
	<div class="w-full max-w-md">
		<div class="rounded-2xl bg-white p-8 shadow-lg">
			{#if !success}
				<div class="mb-8 text-center">
					<h1 class="text-3xl font-bold text-gray-900">Reset Password</h1>
					<p class="mt-2 text-sm text-gray-600">
						Choose a strong password to secure your account
					</p>
				</div>
				
				<form onsubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} class="space-y-6">
					<!-- New Password -->
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700">
							New Password
						</label>
						<div class="relative mt-1">
							<Lock size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Enter new password"
								required
								disabled={loading}
								class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
							<button
								type="button"
								onclick={() => showPassword = !showPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{#if showPassword}
									<EyeOff size={20} />
								{:else}
									<Eye size={20} />
								{/if}
							</button>
						</div>
						
						{#if password && passwordStrength().score > 0}
							<div class="mt-2">
								<div class="flex items-center justify-between">
									<span class="text-xs {passwordStrength().color}">
										{passwordStrength().text}
									</span>
									<div class="flex gap-1">
										{#each Array(5) as _, i}
											<div 
												class="h-1 w-8 rounded-full transition-colors {i < passwordStrength().score ? 'bg-green-500' : 'bg-gray-200'}"
											/>
										{/each}
									</div>
								</div>
								
								<div class="mt-2 space-y-1 text-xs">
									{#each Object.entries(passwordStrength().checks) as [check, passed]}
										<div class="flex items-center gap-1 {passed ? 'text-green-600' : 'text-gray-400'}">
											<Check size={12} class="{passed ? 'opacity-100' : 'opacity-30'}" />
											<span>
												{check === 'length' && 'At least 8 characters'}
												{check === 'uppercase' && 'One uppercase letter'}
												{check === 'lowercase' && 'One lowercase letter'}
												{check === 'numbers' && 'One number'}
												{check === 'special' && 'One special character'}
											</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
					
					<!-- Confirm Password -->
					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700">
							Confirm Password
						</label>
						<div class="relative mt-1">
							<Lock size={20} class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								id="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								placeholder="Confirm new password"
								required
								disabled={loading}
								class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
							/>
							<button
								type="button"
								onclick={() => showConfirmPassword = !showConfirmPassword}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								{#if showConfirmPassword}
									<EyeOff size={20} />
								{:else}
									<Eye size={20} />
								{/if}
							</button>
						</div>
						
						{#if confirmPassword && password !== confirmPassword}
							<p class="mt-1 text-xs text-red-500">Passwords do not match</p>
						{/if}
					</div>
					
					<Button
						type="submit"
						variant="default"
						size="lg"
						class="w-full"
						disabled={loading || passwordStrength().score < 3 || password !== confirmPassword}
					>
						{loading ? 'Updating...' : 'Reset Password'}
					</Button>
				</form>
			{:else}
				<div class="text-center">
					<div class="mb-4 flex justify-center">
						<div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
							<Check size={32} class="text-green-600" />
						</div>
					</div>
					
					<h2 class="text-2xl font-bold text-gray-900">Password Updated!</h2>
					<p class="mt-2 text-sm text-gray-600">
						Your password has been successfully reset.
					</p>
					<p class="mt-1 text-xs text-gray-500">
						Redirecting to login...
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>