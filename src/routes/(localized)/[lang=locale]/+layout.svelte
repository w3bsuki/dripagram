<script lang="ts">
	import type { LayoutData } from './$types';
	import { setLocaleContext } from '$lib/stores/locale.svelte';
	import { browser } from '$app/environment';

	let { children, data }: { children: any; data: LayoutData } = $props();

	// Initialize locale context with server-provided data
	const localeManager = setLocaleContext(data.lang, data.region);

	// Initialize locale manager when component mounts in browser
	if (browser) {
		localeManager.initialize(data.lang, data.region);
	}
</script>

{@render children()}