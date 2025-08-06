<script lang="ts">
	import SellForm from '$lib/components/sell/SellForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SellForm userId={data.user?.id || ''} />
