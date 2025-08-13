<script lang="ts">
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		class: className = '',
		children,
		...props
	}: Props = $props();
</script>

<div
	class="text-sm text-gray-600 {className}"
	{...props}
>
	{@render children?.()}
</div>