<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/native/Button.svelte';
	import { Check, Home, Package, Share2 } from '@lucide/svelte';
	
	// Get product ID from query params
	let productId = $derived($page.url.searchParams.get('id'));
	let productTitle = $derived($page.url.searchParams.get('title'));
	let countdown = $state(5);
	
	// Auto-redirect after 5 seconds
	onMount(() => {
		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				goto('/');
			}
		}, 1000);
		
		return () => clearInterval(timer);
	});
	
	function shareProduct() {
		if ('share' in navigator && productId) {
			navigator.share({
				title: productTitle || 'Check out my listing',
				text: 'I just listed this item on Driplo!',
				url: `${window.location.origin}/products/${productId}`
			});
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
	<div class="max-w-md w-full text-center">
		<!-- Success Icon -->
		<div class="mb-6 inline-flex">
			<div class="relative">
				<div class="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
					<Check size={48} class="text-green-600" />
				</div>
				<!-- Animated pulse ring -->
				<div class="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-20"></div>
			</div>
		</div>
		
		<!-- Success Message -->
		<h1 class="text-3xl font-bold text-gray-900 mb-3">
			Listing Published! 🎉
		</h1>
		
		<p class="text-gray-600 mb-8">
			Your item is now live and ready for buyers to discover.
			{#if productTitle}
				<span class="block mt-2 font-medium text-gray-900">"{productTitle}"</span>
			{/if}
		</p>
		
		<!-- Quick Stats -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
			<div class="grid grid-cols-3 gap-4 text-sm">
				<div>
					<p class="text-gray-500 mb-1">Status</p>
					<p class="font-semibold text-green-600">Active</p>
				</div>
				<div>
					<p class="text-gray-500 mb-1">Visibility</p>
					<p class="font-semibold">Public</p>
				</div>
				<div>
					<p class="text-gray-500 mb-1">Views</p>
					<p class="font-semibold">0</p>
				</div>
			</div>
		</div>
		
		<!-- Action Buttons -->
		<div class="space-y-3 mb-6">
			{#if productId}
				<Button
					onclick={() => goto(`/products/${productId}`)}
					class="w-full gap-2"
				>
					<Package size={18} />
					View Your Listing
				</Button>
			{/if}
			
			<Button
				variant="outline"
				onclick={() => goto('/sell')}
				class="w-full"
			>
				List Another Item
			</Button>
			
			{#if productId && 'share' in navigator}
				<Button
					variant="outline"
					onclick={shareProduct}
					class="w-full gap-2"
				>
					<Share2 size={18} />
					Share Listing
				</Button>
			{/if}
		</div>
		
		<!-- Auto-redirect notice -->
		<div class="text-sm text-gray-500">
			<p>Redirecting to home in {countdown} seconds...</p>
			<button
				onclick={() => goto('/')}
				class="text-blue-600 hover:underline mt-1"
			>
				Go home now
			</button>
		</div>
		
		<!-- Tips -->
		<div class="mt-8 p-4 bg-blue-50 rounded-lg text-left">
			<p class="text-sm font-medium text-blue-900 mb-2">💡 Pro Tips:</p>
			<ul class="text-sm text-blue-800 space-y-1">
				<li>• Share your listing on social media for more views</li>
				<li>• Respond to buyer messages quickly</li>
				<li>• Keep your listing updated with availability</li>
			</ul>
		</div>
	</div>
</div>