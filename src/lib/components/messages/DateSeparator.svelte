<script lang="ts">
	import type { DateSeparatorProps } from '$lib/types/messaging';

	let { date }: DateSeparatorProps = $props();
</script>

<div class="date-separator">
	<span>{date}</span>
</div>

<style>
	.date-separator {
		text-align: center;
		margin: 1rem 0;
	}

	.date-separator span {
		background: var(--color-gray-100);
		color: var(--color-text-secondary);
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
	}
</style>
