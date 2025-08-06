<script lang="ts">
	import { Send, Image, Smile, Heart } from '@lucide/svelte';
	import type { MessageInputProps } from '$lib/types/messaging';

	let {
		value = $bindable(),
		onSend,
		disabled = false,
		placeholder = 'Message...',
	}: MessageInputProps = $props();

	let textareaRef = $state<HTMLTextAreaElement>();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			if (value.trim() && !disabled) {
				onSend();
			}
		}
	}

	function handleSend() {
		if (value.trim() && !disabled) {
			onSend();
		}
	}
</script>

<div class="message-input-container">
	<div class="input-wrapper">
		<button class="attachment-btn" {disabled}>
			<Image size={20} />
		</button>

		<textarea
			bind:this={textareaRef}
			bind:value
			{placeholder}
			class="message-input"
			rows="1"
			{disabled}
			onkeydown={handleKeyDown}
		></textarea>

		<button class="emoji-btn" {disabled}>
			<Smile size={20} />
		</button>

		{#if value.trim()}
			<button class="send-btn" onclick={handleSend} {disabled}>
				<Send size={20} />
			</button>
		{:else}
			<button class="like-btn" {disabled}>
				<Heart size={20} />
			</button>
		{/if}
	</div>
</div>

<style>
	.message-input-container {
		padding: 1rem;
		background: var(--color-background);
		border-top: 1px solid var(--color-border);
	}

	.input-wrapper {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		background: var(--color-gray-50);
		border-radius: 20px;
		padding: 0.5rem;
	}

	.attachment-btn,
	.emoji-btn,
	.send-btn,
	.like-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 50%;
		color: var(--color-text-primary);
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.attachment-btn:hover,
	.emoji-btn:hover {
		background: var(--color-gray-200);
	}

	.send-btn {
		color: var(--color-primary);
	}

	.send-btn:hover {
		background: var(--color-primary-light);
	}

	.like-btn {
		color: var(--color-text-error);
	}

	.like-btn:hover {
		background: var(--color-surface-error) / 10;
	}

	.message-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-primary);
		outline: none;
		resize: none;
		max-height: 120px;
		line-height: 1.4;
	}

	.message-input::placeholder {
		color: var(--color-text-secondary);
	}

	.message-input:disabled,
	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
