<script lang="ts">
	import type { MessagesSkeletonProps } from '$lib/types/messaging';

	let { count = 8 }: MessagesSkeletonProps = $props();
</script>

<div class="skeleton-container">
	{#each Array(count) as _}
		<div class="conversation-skeleton">
			<div class="bg-muted h-14 w-14 animate-pulse rounded-full"></div>
			<div class="flex-1">
				<div class="bg-muted mb-2 h-3 animate-pulse rounded"></div>
				<div class="bg-muted h-3 w-3/5 animate-pulse rounded"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.skeleton-container {
		display: flex;
		flex-direction: column;
	}

	.conversation-skeleton {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.bg-muted {
		background-color: var(--color-gray-200);
	}

	.w-14 {
		width: 3.5rem;
	}

	.h-14 {
		height: 3.5rem;
	}

	.h-3 {
		height: 0.75rem;
	}

	.w-3\/5 {
		width: 60%;
	}

	.rounded-full {
		border-radius: 9999px;
	}

	.rounded {
		border-radius: 0.25rem;
	}

	.mb-2 {
		margin-bottom: 0.5rem;
	}

	.flex-1 {
		flex: 1 1 0%;
	}
</style>
