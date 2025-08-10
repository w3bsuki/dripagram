<script lang="ts">
	import type { MessageBubbleProps } from '$lib/types/messaging';

	let { 
		message, 
		isFromCurrentUser,
		isOwn,
		senderName,
		senderAvatar,
		showTime = true 
	}: MessageBubbleProps = $props();
	
	// Support both isOwn and isFromCurrentUser props
	const isCurrentUser = $derived(isOwn ?? isFromCurrentUser ?? false);

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		});
	}
</script>

<div class="message-wrapper {isCurrentUser ? 'outgoing' : 'incoming'}">
	{#if !isCurrentUser && senderAvatar}
		<img 
			src={senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName || 'User')}&background=random`} 
			alt={senderName || 'User'}
			class="sender-avatar"
		/>
	{/if}
	
	<div class="message-content">
		{#if !isCurrentUser && senderName}
			<span class="sender-name">{senderName}</span>
		{/if}
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
				{#if isCurrentUser}
					<span class="read-status {message.is_read ? 'read' : 'sent'}">
						{message.is_read ? '✓✓' : '✓'}
					</span>
				{/if}
			</div>
		{/if}
		</div>
	</div>
</div>

<style>
	.message-wrapper {
		display: flex;
		align-items: flex-end;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	.message-wrapper.outgoing {
		justify-content: flex-end;
	}

	.message-wrapper.incoming {
		justify-content: flex-start;
	}

	.sender-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.message-content {
		display: flex;
		flex-direction: column;
		max-width: 70%;
	}

	.sender-name {
		font-size: 0.75rem;
		color: var(--color-gray-500);
		margin-bottom: 0.25rem;
		margin-left: 0.5rem;
		font-weight: 500;
	}

	.message-bubble {
		min-width: 80px;
		position: relative;
		display: inline-block;
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
		.message-content {
			max-width: 85%;
		}
		
		.sender-avatar {
			width: 28px;
			height: 28px;
		}
	}
</style>
