<script lang="ts">
	import { Send, Image, Smile, Heart } from '@lucide/svelte';
	import type { MessageInputProps } from '$lib/types/messaging';

	let {
		value = $bindable(),
		onSend,
		onTyping,
		disabled = false,
		placeholder = 'Message...',
		typingUsers = []
	}: MessageInputProps = $props();

	let textareaRef = $state<HTMLTextAreaElement>();
	let typingTimeout = $state<NodeJS.Timeout | null>(null);
	let isCurrentlyTyping = $state(false);

	// Auto-resize textarea
	$effect(() => {
		if (textareaRef && value) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = `${Math.min(textareaRef.scrollHeight, 120)}px`;
		}
	});

	// Handle typing indicator
	$effect(() => {
		if (value && value.trim().length > 0 && !isCurrentlyTyping) {
			// Start typing
			isCurrentlyTyping = true;
			onTyping?.(true);
			
			// Clear existing timeout
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
			
			// Set new timeout to stop typing after 3 seconds of inactivity
			typingTimeout = setTimeout(() => {
				isCurrentlyTyping = false;
				onTyping?.(false);
			}, 3000);
		} else if (!value || value.trim().length === 0) {
			// Stop typing if input is empty
			if (isCurrentlyTyping) {
				isCurrentlyTyping = false;
				onTyping?.(false);
			}
			if (typingTimeout) {
				clearTimeout(typingTimeout);
				typingTimeout = null;
			}
		}
	});

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
			// Stop typing indicator
			if (isCurrentlyTyping) {
				isCurrentlyTyping = false;
				onTyping?.(false);
			}
			if (typingTimeout) {
				clearTimeout(typingTimeout);
				typingTimeout = null;
			}
			
			onSend();
		}
	}
</script>

<div class="message-input-container">
	{#if typingUsers && typingUsers.length > 0}
		<div class="typing-indicator">
			<span class="typing-dots">
				<span class="dot"></span>
				<span class="dot"></span>
				<span class="dot"></span>
			</span>
			<span class="typing-text">
				{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
			</span>
		</div>
	{/if}
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

	/* Typing indicator styles */
	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		animation: fadeIn 0.3s ease;
	}

	.typing-dots {
		display: flex;
		gap: 0.25rem;
	}

	.dot {
		width: 8px;
		height: 8px;
		background: var(--color-text-secondary);
		border-radius: 50%;
		animation: bounce 1.4s infinite ease-in-out;
	}

	.dot:nth-child(1) {
		animation-delay: -0.32s;
	}

	.dot:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes bounce {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
