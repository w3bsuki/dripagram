<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Check, Home, Package, Share2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { languageTag } from '$lib/paraglide/runtime';
	
	// Get product ID from query params
	let productId = $derived($page.url.searchParams.get('id'));
	let productTitle = $derived($page.url.searchParams.get('title'));
	let countdown = $state(5);
	
	// Get current language
	const lang = languageTag();
	
	// Auto-redirect after 5 seconds
	onMount(() => {
		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				goto(`/${lang}`);
			}
		}, 1000);
		
		return () => clearInterval(timer);
	});
	
	function shareProduct() {
		if ('share' in navigator && productId) {
			navigator.share({
				title: productTitle || 'Check out my listing',
				text: 'I just listed this item on Driplo!',
				url: `${window.location.origin}/${lang}/products/${productId}`
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
			{m['sell_success.title']()}
		</h1>
		
		<p class="text-gray-600 mb-8">
			{m['sell_success.subtitle']()}
			{#if productTitle}
				<span class="block mt-2 font-medium text-gray-900">"{productTitle}"</span>
			{/if}
		</p>
		
		<!-- Quick Stats -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
			<div class="grid grid-cols-3 gap-4 text-sm">
				<div>
					<p class="text-gray-500 mb-1">{m['sell_success.status']()}</p>
					<p class="font-semibold text-green-600">{m['sell_success.active']()}</p>
				</div>
				<div>
					<p class="text-gray-500 mb-1">{m['sell_success.visibility']()}</p>
					<p class="font-semibold">{m['sell_success.public']()}</p>
				</div>
				<div>
					<p class="text-gray-500 mb-1">{m['sell_success.views']()}</p>
					<p class="font-semibold">0</p>
				</div>
			</div>
		</div>
		
		<!-- Action Buttons -->
		<div class="space-y-3 mb-6">
			{#if productId}
				<Button
					onclick={() => goto(`/${lang}/products/${productId}`)}
					class="w-full gap-2"
				>
					<Package size={18} />
					{m['sell_success.view_listing']()}
				</Button>
			{/if}
			
			<Button
				variant="outline"
				onclick={() => goto(`/${lang}/sell`)}
				class="w-full"
			>
				{m['sell_success.list_another']()}
			</Button>
			
			{#if productId && 'share' in navigator}
				<Button
					variant="outline"
					onclick={shareProduct}
					class="w-full gap-2"
				>
					<Share2 size={18} />
					{m['sell_success.share_listing']()}
				</Button>
			{/if}
		</div>
		
		<!-- Auto-redirect notice -->
		<div class="text-sm text-gray-500">
			<p>{m['sell_success.redirecting']({ countdown })}</p>
			<button
				onclick={() => goto(`/${lang}`)}
				class="text-blue-600 hover:underline mt-1"
			>
				{m['sell_success.go_home_now']()}
			</button>
		</div>
		
		<!-- Tips -->
		<div class="mt-8 p-4 bg-blue-50 rounded-lg text-left">
			<p class="text-sm font-medium text-blue-900 mb-2">{m['sell_success.pro_tips']()}</p>
			<ul class="text-sm text-blue-800 space-y-1">
				<li>{m['sell_success.tip_1']()}</li>
				<li>{m['sell_success.tip_2']()}</li>
				<li>{m['sell_success.tip_3']()}</li>
			</ul>
		</div>
	</div>
</div>