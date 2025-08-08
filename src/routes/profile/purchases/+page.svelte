<script lang="ts">
	import { ShoppingBag } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	
	const auth = getAuthContext();
	
	function formatPrice(price: number): string {
		return `$${price.toFixed(2)}`;
	}
	
	let purchases = $state<any[]>([]);
	let loading = $state(true);
	
	// Simulated data for now
	$effect(() => {
		setTimeout(() => {
			loading = false;
		}, 500);
	});
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="container mx-auto max-w-4xl px-4">
		<h1 class="mb-6 text-2xl font-bold">Purchase History</h1>
		
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
			</div>
		{:else if purchases.length === 0}
			<div class="rounded-lg bg-white p-12 text-center shadow-sm">
				<ShoppingBag class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h2 class="mb-2 text-xl font-semibold text-gray-900">No purchases yet</h2>
				<p class="mb-6 text-gray-500">Start shopping to see your order history here!</p>
				<Button onclick={() => goto('/browse')}>
					Start Shopping
				</Button>
			</div>
		{:else}
			<div class="space-y-4">
				{#each purchases as order}
					<div class="rounded-lg bg-white p-6 shadow-sm">
						<div class="mb-4 flex items-center justify-between">
							<div>
								<p class="text-sm text-gray-500">Order #{order.id}</p>
								<p class="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
							</div>
							<div class="text-right">
								<p class="text-lg font-semibold">{formatPrice(order.total)}</p>
								<span class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
									{order.status}
								</span>
							</div>
						</div>
						
						<div class="space-y-2">
							{#each order.items as item}
								<div class="flex items-center gap-3">
									<img
										src={item.image}
										alt={item.title}
										class="h-16 w-16 rounded-lg object-cover"
									/>
									<div class="flex-1">
										<p class="font-medium">{item.title}</p>
										<p class="text-sm text-gray-500">Qty: {item.quantity}</p>
									</div>
									<p class="font-medium">{formatPrice(item.price)}</p>
								</div>
							{/each}
						</div>
						
						<div class="mt-4 flex gap-2">
							<Button variant="outline" size="sm">View Order</Button>
							<Button variant="outline" size="sm">Track Package</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>