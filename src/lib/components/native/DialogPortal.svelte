<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';

	interface Props {
		to?: string | HTMLElement;
		children: Snippet;
	}

	let { to = 'body', children }: Props = $props();

	let portalTarget = $state<HTMLElement | null>(null);
	let portalContainer = $state<HTMLDivElement | null>(null);

	function getTarget(): HTMLElement {
		if (typeof to === 'string') {
			return document.querySelector(to) || document.body;
		}
		return to || document.body;
	}

	$effect(() => {
		if (browser) {
			portalTarget = getTarget();
			portalContainer = document.createElement('div');
			portalContainer.style.display = 'contents';
			portalTarget.appendChild(portalContainer);

			return () => {
				if (portalContainer && portalTarget && portalTarget.contains(portalContainer)) {
					portalTarget.removeChild(portalContainer);
				}
			};
		}
	});
</script>

{#if browser && portalContainer}
	<!-- This renders the children into the portal container -->
	{@render children()}
{/if}