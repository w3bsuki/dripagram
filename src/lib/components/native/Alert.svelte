<script lang="ts">
	interface Props {
		variant?: 'default' | 'destructive';
		class?: string;
		children?: import('svelte').Snippet;
	}

	let {
		variant = 'default',
		class: className = '',
		children,
		...props
	}: Props = $props();

	const baseClasses = 'relative w-full rounded-lg border px-4 py-3 text-sm';
	
	const variantClasses = {
		default: 'bg-white text-gray-900 border-gray-200',
		destructive: 'bg-red-50 text-red-900 border-red-200'
	};
</script>

<div
	class="{baseClasses} {variantClasses[variant]} {className}"
	role="alert"
	{...props}
>
	{@render children?.()}
</div>