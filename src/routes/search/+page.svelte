<script lang="ts">
	import { Search } from '@lucide/svelte';

	let searchQuery = $state('');
</script>

<svelte:head>
	<title>Търсене - Driplo.bg</title>
</svelte:head>

<div class="container mx-auto space-y-6 p-4">
	<h1 class="mb-6 text-2xl font-bold">Търсене на продукти</h1>

	<!-- Search Bar -->
	<div class="rounded-lg border border-gray-200 bg-white p-4">
		<div class="flex items-center gap-3">
			<Search size={16} class="text-gray-400" />
			<input
				bind:value={searchQuery}
				type="search"
				placeholder="Търси продукти, марки..."
				class="flex-1 outline-none"
			/>
			<button class="bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-white">Търси</button>
		</div>
	</div>

	<!-- Results -->
	<div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
		<p class="text-gray-600">Въведете търсене за да видите резултати</p>
	</div>
</div>
