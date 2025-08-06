<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { LogOut, Settings, Package, Heart, ShoppingBag, User } from '@lucide/svelte';
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
	const auth = getAuthContext();
	
	async function handleSignOut() {
		const { error } = await data.supabase.auth.signOut();
		if (!error) {
			await invalidateAll();
			await goto('/');
		}
	}
</script>

<div class="min-h-screen bg-gray-50 px-4 py-8">
	<div class="mx-auto max-w-2xl">
		{#if auth.session && auth.user}
			<div class="rounded-2xl bg-white p-8 shadow-sm">
				<!-- Profile Header -->
				<div class="mb-8 flex items-center gap-4">
					<div class="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
						<div class="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold text-gray-900">
							{auth.user.email?.[0]?.toUpperCase() || 'U'}
						</div>
					</div>
					<div>
						<h1 class="text-2xl font-bold text-gray-900">
							{auth.user.user_metadata?.username || auth.user.email?.split('@')[0] || 'User'}
						</h1>
						<p class="text-sm text-gray-600">{auth.user.email}</p>
						{#if auth.user.user_metadata?.account_type === 'brand'}
							<span class="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
								Brand Account
							</span>
						{/if}
					</div>
				</div>

				<!-- Profile Actions -->
				<div class="space-y-2">
					<a
						href="/profile/listings"
						class="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
					>
						<Package size={20} class="text-gray-600" />
						<span class="font-medium text-gray-900">My Listings</span>
					</a>
					
					<a
						href="/profile/purchases"
						class="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
					>
						<ShoppingBag size={20} class="text-gray-600" />
						<span class="font-medium text-gray-900">My Purchases</span>
					</a>
					
					<a
						href="/profile/likes"
						class="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
					>
						<Heart size={20} class="text-gray-600" />
						<span class="font-medium text-gray-900">Liked Items</span>
					</a>
					
					<a
						href="/profile/settings"
						class="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
					>
						<Settings size={20} class="text-gray-600" />
						<span class="font-medium text-gray-900">Settings</span>
					</a>
					
					<button
						onclick={handleSignOut}
						class="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
					>
						<LogOut size={20} class="text-red-600" />
						<span class="font-medium text-red-600">Sign Out</span>
					</button>
				</div>

				<!-- Account Info -->
				<div class="mt-8 border-t pt-6">
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
						Account Information
					</h2>
					<dl class="space-y-3 text-sm">
						<div class="flex justify-between">
							<dt class="text-gray-600">Account Type</dt>
							<dd class="font-medium text-gray-900">
								{auth.user.user_metadata?.account_type === 'brand' ? 'Brand' : 'Personal'}
							</dd>
						</div>
						{#if auth.user.user_metadata?.brand_name}
							<div class="flex justify-between">
								<dt class="text-gray-600">Brand Name</dt>
								<dd class="font-medium text-gray-900">{auth.user.user_metadata.brand_name}</dd>
							</div>
						{/if}
						<div class="flex justify-between">
							<dt class="text-gray-600">Member Since</dt>
							<dd class="font-medium text-gray-900">
								{new Date(auth.user.created_at).toLocaleDateString()}
							</dd>
						</div>
					</dl>
				</div>
			</div>
		{:else}
			<div class="rounded-2xl bg-white p-8 text-center shadow-sm">
				<h1 class="mb-4 text-2xl font-bold text-gray-900">Sign in Required</h1>
				<p class="mb-6 text-gray-600">Please sign in to view your profile.</p>
				<a
					href="/auth/login"
					class="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
				>
					Sign In
				</a>
			</div>
		{/if}
	</div>
</div>