<script lang="ts">
	import type { MessageBubbleProps } from '$lib/types/messaging';

	let { message, isFromCurrentUser, showTime = true }: MessageBubbleProps = $props();

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		});
	}
</script>

<div class="message-wrapper {isFromCurrentUser ? 'outgoing' : 'incoming'}">
	<div class="message-bubble">
		{#if message.message_type === 'image'}
			<img src={message.image_url} alt="" class="message-image" />
		{:else if message.message_type === 'product'}
			<div class="shared-product">🛍️ Shared a product</div>
		{:else}
			<span class="message-text">{message.content}</span>
		{/if}

		{#if showTime}
			<div class="message-footer">
				<span class="message-time">{formatTime(message.created_at)}</span>
				{#if isFromCurrentUser}
					<span class="read-status {message.is_read ? 'read' : 'sent'}">
						{message.is_read ? '✓✓' : '✓'}
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.message-wrapper {
		display: flex;
		margin-bottom: 0.25rem;
	}

	.message-wrapper.outgoing {
		justify-content: flex-end;
	}

	.message-wrapper.incoming {
		justify-content: flex-start;
	}

	.message-bubble {
		max-width: 70%;
		min-width: 80px;
		position: relative;
	}

	.outgoing .message-bubble {
		background: var(--color-primary);
		color: var(--color-surface-primary);
		border-radius: 18px 18px 4px 18px;
		padding: 0.75rem 1rem;
	}

	.incoming .message-bubble {
		background: var(--color-gray-100);
		color: var(--color-text-primary);
		border-radius: 18px 18px 18px 4px;
		padding: 0.75rem 1rem;
	}

	.message-text {
		font-size: 0.875rem;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.message-image {
		width: 100%;
		max-width: 200px;
		border-radius: 12px;
		margin-bottom: 0.5rem;
	}

	.shared-product {
		font-size: 0.875rem;
		font-style: italic;
	}

	.message-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.25rem;
		gap: 0.5rem;
	}

	.message-time {
		font-size: 0.6875rem;
		opacity: 0.7;
	}

	.read-status {
		font-size: 0.6875rem;
		opacity: 0.7;
	}

	.read-status.read {
		color: var(--color-primary);
	}

	/* Mobile Adjustments */
	@media (max-width: 640px) {
		.message-bubble {
			max-width: 85%;
		}
	}
</style>
