<script lang="ts">
	import type { PageData } from './$types';
	
	// This page redirects to localized routes, so it never renders
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Driplo - The Amazon of Clothing | Shop & Sell Fashion</title>
	<meta
		name="description"
		content="Discover and sell fashion on Bulgaria's #1 social commerce platform. Join thousands buying and selling designer clothes, streetwear, and vintage finds."
	/>
</svelte:head>

<!-- This page immediately redirects via +page.server.ts -->
<main>
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="text-2xl font-bold">Loading...</h1>
			<p class="text-gray-600">Redirecting to your preferred language</p>
		</div>
	</div>
</main>