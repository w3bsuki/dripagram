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
		autocomplete?: string | null;
		'aria-label'?: string;
		'aria-describedby'?: string;
		hasIcon?: boolean; // New prop to indicate if input has an icon
		oninput?: (event: Event) => void;
		onchange?: (event: Event) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		class: className = '',
		hasIcon = false,
		...props
	}: Props = $props();

	// Check if this is used in auth forms (form-input class)
	const isAuthInput = className.includes('form-input');
	
	const baseClasses = isAuthInput 
		? 'flex w-full rounded-md border bg-white text-base transition-colors file:border-0 file:bg-transparent placeholder:text-gray-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
		: 'flex h-9 w-full rounded-md border border-gray-300 bg-white py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
	
	const paddingClasses = isAuthInput 
		? (hasIcon ? 'h-12 pl-10 pr-3 py-0' : 'h-12 px-4 py-0')
		: (hasIcon ? 'pl-10 pr-3' : 'px-3');
</script>

<input
	bind:value
	{type}
	class="{baseClasses} {paddingClasses} {className}"
	{...props}
/>