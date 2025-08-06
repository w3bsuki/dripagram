<script lang="ts">
	import type { EmptyMessagesProps } from '$lib/types/messaging';

	let {
		title = 'No messages yet',
		description = "Start messaging sellers about items you're interested in!",
		icon = '💬',
	}: EmptyMessagesProps = $props();
</script>

<div class="empty-state">
	<div class="empty-icon">{icon}</div>
	<h3>{title}</h3>
	<p>{description}</p>
</div>

<style>
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-secondary);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		font-size: 0.875rem;
		line-height: 1.5;
		max-width: 300px;
		margin: 0 auto;
	}
</style>
