<script lang="ts">
	interface Props {
		value?: string | number;
		type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
		placeholder?: string;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		class?: string;
		id?: string;
		name?: string;
		autocomplete?: string;
		'aria-label'?: string;
		'aria-describedby'?: string;
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		class: className = '',
		...props
	}: Props = $props();

	const baseClasses = 'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
</script>

<input
	bind:value
	{type}
	class="{baseClasses} {className}"
	{...props}
/>