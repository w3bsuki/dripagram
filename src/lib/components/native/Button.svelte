<script lang="ts">
	interface Props {
		variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
		size?: 'sm' | 'default' | 'lg' | 'icon';
		class?: string;
		onclick?: () => void;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		children?: import('svelte').Snippet;
		'aria-label'?: string;
	}

	let { 
		variant = 'default', 
		size = 'default', 
		class: className = '',
		children,
		onclick,
		disabled = false,
		type = 'button',
		...props 
	}: Props = $props();

	const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
	
	const variants = {
		default: 'bg-black text-white hover:bg-gray-800 focus-visible:ring-gray-400',
		destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400',
		outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-gray-400',
		secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400',
		ghost: 'hover:bg-gray-100 focus-visible:ring-gray-400'
	};
	
	const sizes = {
		sm: 'h-9 px-3',
		default: 'h-10 px-4 py-2',
		lg: 'h-11 px-8',
		icon: 'h-10 w-10'
	};
</script>

<button 
	class="{base} {variants[variant]} {sizes[size]} {className}" 
	{type}
	{disabled}
	{onclick}
	{...props}
>
	{@render children?.()}
</button>