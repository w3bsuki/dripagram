<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	
	const auth = getAuthContext();
	
	let likedItems = $state<any[]>([]);
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
		<h1 class="mb-6 text-2xl font-bold">Liked Items</h1>
		
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
			</div>
		{:else if likedItems.length === 0}
			<div class="rounded-lg bg-white p-12 text-center shadow-sm">
				<Heart class="mx-auto mb-4 h-16 w-16 text-gray-300" />
				<h2 class="mb-2 text-xl font-semibold text-gray-900">No liked items yet</h2>
				<p class="mb-6 text-gray-500">Items you like will appear here!</p>
				<Button onclick={() => goto('/browse')}>
					Discover Items
				</Button>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each likedItems as item}
					<div class="group relative rounded-lg bg-white shadow-sm">
						<img
							src={item.image}
							alt={item.title}
							class="h-64 w-full rounded-t-lg object-cover"
						/>
						<div class="p-4">
							<h3 class="font-semibold">{item.title}</h3>
							<p class="text-lg font-bold text-blue-600">${item.price}</p>
							<p class="text-sm text-gray-500">by {item.seller}</p>
						</div>
						
						<!-- Overlay on hover -->
						<div class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
							<div class="flex gap-2">
								<Button size="sm">View Item</Button>
								<Button size="sm" variant="outline">
									<Heart size={16} class="fill-current" />
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>