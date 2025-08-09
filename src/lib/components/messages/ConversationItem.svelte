<script lang="ts">
	import { MoreHorizontal } from '@lucide/svelte';
	import type { ConversationItemProps } from '$lib/types/messaging';

	let { conversation, currentUserId, onClick }: ConversationItemProps = $props();

	function formatTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 24) {
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			});
		} else if (diffInHours < 168) {
			// 7 days
			return date.toLocaleDateString('en-US', { weekday: 'short' });
		} else {
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			});
		}
	}

	function formatLastMessage(message: any, isFromMe: boolean): string {
		if (!message) return '';

		const prefix = isFromMe ? 'You: ' : '';

		switch (message.message_type) {
			case 'image':
				return `${prefix}📷 Photo`;
			case 'product':
				return `${prefix}🛍️ Shared a product`;
			default:
				return `${prefix}${message.content}`;
		}
	}
</script>

<div class="conversation-item-wrapper">
	<button class="conversation-item" onclick={onClick}>
		<!-- Avatar -->
		<div class="avatar-container">
			<img
				src={conversation.other_user.avatar_url ||
					`https://ui-avatars.com/api/?name=${conversation.other_user.username}`}
				alt={conversation.other_user.username}
				class="user-avatar"
			/>
			{#if conversation.other_user.verified}
				<span class="verified-badge">✓</span>
			{/if}
		</div>

		<!-- Conversation Info -->
		<div class="conversation-content">
			<div class="conversation-header">
				<span class="username">{conversation.other_user.username}</span>
				<span class="timestamp">{formatTime(conversation.last_message_at)}</span>
			</div>

			<div class="last-message">
				<span class="message-text">
					{formatLastMessage(
						conversation.last_message,
						conversation.last_message?.sender_id === currentUserId
					)}
				</span>
				{#if conversation.unread_count > 0}
					<span class="unread-badge">{conversation.unread_count}</span>
				{/if}
			</div>

			<!-- Product Preview (if conversation is about a specific product) -->
			{#if conversation.product}
				<div class="product-preview">
					<img
						src={conversation.product.images[0]}
						alt={conversation.product.title}
						class="product-image"
					/>
					<span class="product-title">{conversation.product.title}</span>
					<span class="product-price">{conversation.product.price}лв</span>
				</div>
			{/if}
		</div>
	</button>

	<!-- More Options -->
	<button class="more-btn" onclick={(e) => e.stopPropagation()} aria-label="More options">
		<MoreHorizontal size={20} />
	</button>
</div>

<style>
	.conversation-item-wrapper {
		display: flex;
		align-items: center;
		border-bottom: 1px solid var(--color-border);
	}

	.conversation-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: background 0.2s;
		text-align: left;
		flex: 1;
	}

	.conversation-item:hover {
		background: var(--color-gray-50);
	}

	.conversation-item:active {
		background: var(--color-gray-100);
	}

	.avatar-container {
		position: relative;
		flex-shrink: 0;
	}

	.user-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		object-fit: cover;
	}

	.verified-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		background: var(--color-primary);
		color: var(--color-surface-primary);
		width: 18px;
		height: 18px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-2xs);
		font-weight: 700;
		border: 2px solid var(--color-background);
	}

	.conversation-content {
		flex: 1;
		min-width: 0;
	}

	.conversation-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.username {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.timestamp {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.last-message {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.message-text {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.unread-badge {
		background: var(--color-primary);
		color: var(--color-surface-primary);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
		min-width: 20px;
		text-align: center;
		margin-left: 0.5rem;
	}

	.product-preview {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--color-gray-50);
		border-radius: 8px;
		margin-top: 0.5rem;
	}

	.product-image {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		object-fit: cover;
	}

	.product-title {
		font-size: 0.75rem;
		color: var(--color-text-primary);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-price {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.more-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		color: var(--color-text-secondary);
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.more-btn:hover {
		background: var(--color-gray-100);
		color: var(--color-text-primary);
	}
</style>
