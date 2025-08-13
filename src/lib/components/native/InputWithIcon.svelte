<script lang="ts">
	import type { ComponentType } from 'svelte';
	
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
		leftIcon?: ComponentType;
		rightIcon?: ComponentType;
		onRightIconClick?: () => void;
		rightIconLabel?: string;
		oninput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onchange?: (event: Event & { currentTarget: HTMLInputElement }) => void;
		onfocus?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
		onblur?: (event: FocusEvent & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		value = $bindable(''),
		type = 'text',
		class: className = '',
		leftIcon,
		rightIcon,
		onRightIconClick,
		rightIconLabel,
		oninput,
		onchange,
		onfocus,
		onblur,
		...props
	}: Props = $props();

	// Static padding classes
	const paddingClass = `${leftIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'}`;
</script>

<div class="input-field">
	<!-- Left Icon -->
	{#if leftIcon}
		<div class="field-icon field-icon-left">
			<svelte:component this={leftIcon} size={16} />
		</div>
	{/if}
	
	<!-- Input Field -->
	<input
		bind:value
		{type}
		class="field-input {paddingClass} {className}"
		{oninput}
		{onchange}
		{onfocus}
		{onblur}
		{...props}
	/>
	
	<!-- Right Icon -->
	{#if rightIcon}
		<button
			type="button"
			onclick={onRightIconClick}
			class="field-icon field-icon-right password-toggle"
			aria-label={rightIconLabel}
		>
			<svelte:component this={rightIcon} size={16} />
		</button>
	{/if}
</div>

<style>
	.input-field {
		position: relative;
		width: 100%;
	}

	:global(.field-input) {
		width: 100%;
		height: 44px;
		padding: 12px 16px;
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		font-size: 15px;
		background: white;
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		color: var(--color-text-primary);
	}

	:global(.field-input::placeholder) {
		color: #9ca3af;
		opacity: 0.6;
		font-weight: 400;
	}

	:global(.field-input:focus) {
		outline: none;
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	:global(.field-input:disabled) {
		cursor: not-allowed;
		opacity: 0.6;
		background: var(--color-surface-secondary);
	}

	.field-icon {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-secondary);
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.field-icon-left {
		left: 12px;
	}

	.field-icon-right {
		right: 12px;
		pointer-events: auto;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.1s ease;
	}

	.field-icon-right:hover {
		background: var(--color-surface-secondary);
	}

	/* Adjust input padding when icons are present */
	:global(.pl-10) {
		padding-left: 40px !important;
	}

	:global(.pr-10) {
		padding-right: 40px !important;
	}

	:global(.pl-4) {
		padding-left: 16px !important;
	}

	:global(.pr-4) {
		padding-right: 16px !important;
	}
</style>