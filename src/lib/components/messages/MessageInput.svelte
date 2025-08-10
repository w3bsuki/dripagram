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
		padding: 16px;
		background: #ffffff;
		border-top: 1px solid #e5e7eb;
	}

	.input-wrapper {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 24px;
		padding: 8px 12px;
		transition: all 0.2s ease;
		min-height: 44px;
	}

	.input-wrapper:focus-within {
		border-color: #3b82f6;
		background: #ffffff;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.attachment-btn,
	.emoji-btn,
	.send-btn,
	.like-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		border-radius: 50%;
		color: #6b7280;
		transition: all 0.2s ease;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
	}

	.attachment-btn:hover,
	.emoji-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.send-btn {
		background: #3b82f6;
		color: #ffffff;
		transform: scale(1);
	}

	.send-btn:hover {
		background: #2563eb;
		transform: scale(1.05);
	}

	.send-btn:active {
		transform: scale(0.95);
	}

	.like-btn {
		color: #ef4444;
	}

	.like-btn:hover {
		background: #fef2f2;
		color: #dc2626;
	}

	.message-input {
		flex: 1;
		background: none;
		border: none;
		padding: 8px 4px;
		font-size: 15px;
		color: #111827;
		outline: none;
		resize: none;
		max-height: 120px;
		line-height: 1.5;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.message-input::placeholder {
		color: #9ca3af;
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
		gap: 8px;
		padding: 8px 16px;
		color: #6b7280;
		font-size: 14px;
		animation: slideUp 0.2s ease-out;
	}

	.typing-dots {
		display: flex;
		gap: 3px;
	}

	.dot {
		width: 6px;
		height: 6px;
		background: #9ca3af;
		border-radius: 50%;
		animation: pulse 1.4s infinite ease-in-out;
	}

	.dot:nth-child(1) {
		animation-delay: 0s;
	}

	.dot:nth-child(2) {
		animation-delay: 0.2s;
	}

	.dot:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes pulse {
		0%, 60%, 100% {
			transform: scale(0.8);
			opacity: 0.4;
		}
		30% {
			transform: scale(1.2);
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.message-input-container {
			padding: 12px;
		}
		
		.input-wrapper {
			border-radius: 20px;
			padding: 6px 10px;
		}
		
		.message-input {
			font-size: 16px; /* Prevent zoom on iOS */
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.message-input-container {
			background: #1f2937;
			border-top-color: #374151;
		}
		
		.input-wrapper {
			background: #374151;
			border-color: #4b5563;
		}
		
		.input-wrapper:focus-within {
			background: #1f2937;
			border-color: #3b82f6;
		}
		
		.message-input {
			color: #f9fafb;
		}
		
		.message-input::placeholder {
			color: #9ca3af;
		}
		
		.attachment-btn,
		.emoji-btn {
			color: #d1d5db;
		}
		
		.attachment-btn:hover,
		.emoji-btn:hover {
			background: #4b5563;
			color: #f9fafb;
		}
	}
</style>
