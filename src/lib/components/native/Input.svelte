<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'class' | 'value'> {
		value?: string | number;
		class?: string;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onchange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onfocus?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
		onblur?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		class: className = '',
		oninput,
		onchange,
		onfocus,
		onblur,
		...props
	}: Props = $props();

	// Clean, modern input styling with Tailwind - only apply if no custom class provided
	const baseClasses = className.includes('field-input') ? '' : 'w-full h-10 px-3 py-2 text-base bg-white border border-gray-300 rounded-lg transition-all duration-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50';
</script>

<input
	bind:value
	{type}
	class="{baseClasses} {className}"
	{oninput}
	{onchange}
	{onfocus}
	{onblur}
	{...props}
/>