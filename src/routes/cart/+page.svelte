<script lang="ts">
	import { ShoppingBag, Plus, Minus, X, ArrowRight } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { cartStore } from '$lib/stores/cart.svelte.js';

	let cart = cartStore;
	
	function formatPrice(price: number): string {
		return `$${price.toFixed(2)}`;
	}
	
	function updateQuantity(itemId: string, newQuantity: number) {
		if (newQuantity <= 0) {
			cart.removeItem(itemId);
		} else {
			cart.updateQuantity(itemId, newQuantity);
		}
	}

	function proceedToCheckout() {
		// TODO: Implement checkout flow
		goto('/checkout');
	}
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="container mx-auto max-w-4xl px-4">
		<h1 class="mb-8 text-2xl font-bold">Shopping Cart</h1>

		{#if cart.items.length === 0}
			<!-- Empty Cart State -->
			<div class="rounded-lg bg-white p-12 text-center shadow-sm">
				<ShoppingBag class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h2 class="mb-2 text-xl font-semibold text-gray-900">Your cart is empty</h2>
				<p class="mb-6 text-gray-500">Add some items to get started!</p>
				<Button onclick={() => goto('/browse')}>
					Continue Shopping
				</Button>
			</div>
		{:else}
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- Cart Items -->
				<div class="lg:col-span-2">
					<div class="space-y-4">
						{#each cart.items as item}
							<div class="rounded-lg bg-white p-4 shadow-sm">
								<div class="flex gap-4">
									<!-- Product Image -->
									<img
										src={item.image}
										alt={item.name}
										class="h-24 w-24 rounded-lg object-cover"
									/>
									
									<!-- Product Details -->
									<div class="flex-1">
										<div class="flex justify-between">
											<div>
												<h3 class="font-semibold text-gray-900">{item.name}</h3>
												<p class="text-sm text-gray-500">Size: {item.size || 'One Size'}</p>
											</div>
											<button
												onclick={() => cart.removeItem(item.id)}
												class="text-gray-400 hover:text-red-500"
												aria-label="Remove item"
											>
												<X size={20} />
											</button>
										</div>
										
										<!-- Quantity and Price -->
										<div class="mt-4 flex items-center justify-between">
											<div class="flex items-center gap-2">
												<button
													onclick={() => updateQuantity(item.id, item.quantity - 1)}
													class="rounded-full border border-gray-300 p-1 hover:bg-gray-100"
													aria-label="Decrease quantity"
												>
													<Minus size={16} />
												</button>
												<span class="w-8 text-center">{item.quantity}</span>
												<button
													onclick={() => updateQuantity(item.id, item.quantity + 1)}
													class="rounded-full border border-gray-300 p-1 hover:bg-gray-100"
													aria-label="Increase quantity"
												>
													<Plus size={16} />
												</button>
											</div>
											<p class="font-semibold">{formatPrice(item.price * item.quantity)}</p>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Order Summary -->
				<div class="lg:col-span-1">
					<div class="sticky top-4 rounded-lg bg-white p-6 shadow-sm">
						<h2 class="mb-4 text-lg font-semibold">Order Summary</h2>
						
						<div class="space-y-2 border-b pb-4">
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Subtotal</span>
								<span>{formatPrice(cart.subtotal)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Shipping</span>
								<span>{cart.subtotal > 50 ? 'Free' : formatPrice(5.99)}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">Tax</span>
								<span>{formatPrice(cart.tax)}</span>
							</div>
						</div>
						
						<div class="flex justify-between py-4 text-lg font-semibold">
							<span>Total</span>
							<span>{formatPrice(cart.total)}</span>
						</div>
						
						<Button onclick={proceedToCheckout} class="w-full">
							Proceed to Checkout
							<ArrowRight size={16} class="ml-2" />
						</Button>
						
						<button
							onclick={() => goto('/browse')}
							class="mt-4 w-full text-center text-sm text-gray-500 hover:text-gray-700"
						>
							Continue Shopping
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>