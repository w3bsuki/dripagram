<script lang="ts">
	import SellForm from '$lib/components/sell/SellForm.svelte';
	import { setLocale } from '$lib/paraglide/runtime.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	// Set the locale for Paraglide
	setLocale(data.lang);
</script>

<SellForm {data} />