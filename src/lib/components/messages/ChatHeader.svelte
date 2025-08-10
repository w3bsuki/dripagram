<script lang="ts">
	import { ArrowLeft, Phone, Video, Info } from '@lucide/svelte';
	import type { ChatHeaderProps } from '$lib/types/messaging';

	let { otherUser, onBack, onProfileClick }: ChatHeaderProps = $props();
</script>

<header class="chat-header">
	<div class="header-left">
		<button class="back-btn" onclick={onBack}>
			<ArrowLeft size={24} />
		</button>

		{#if otherUser}
			<button class="user-info" onclick={onProfileClick}>
				<img
					src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${otherUser.username}`}
					alt={otherUser.username}
					class="user-avatar"
				/>
				<div class="user-details">
					<span class="username">
						{otherUser.username}
						{#if otherUser.verified}
							<span class="verified-badge">✓</span>
						{/if}
					</span>
					<span class="user-status">Active now</span>
				</div>
			</button>
		{/if}
	</div>

	<div class="header-actions">
		<button class="action-btn">
			<Phone size={20} />
		</button>
		<button class="action-btn">
			<Video size={20} />
		</button>
		<button class="action-btn">
			<Info size={20} />
		</button>
	</div>
</header>

<style>
	.chat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-low);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
		min-width: 0;
	}

	.back-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		color: var(--color-text-primary);
		flex-shrink: 0;
	}

	.back-btn:hover {
		background: var(--color-gray-100);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		flex: 1;
		min-width: 0;
		padding: 0.5rem;
		border-radius: 8px;
		transition: background 0.2s;
	}

	.user-info:hover {
		background: var(--color-gray-50);
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
		flex-shrink: 0;
	}

	.user-details {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.username {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.verified-badge {
		background: var(--color-primary);
		color: var(--color-surface-primary);
		width: 14px;
		height: 14px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-3xs);
		font-weight: 700;
	}

	.user-status {
		font-size: 0.75rem;
		color: var(--color-success);
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		color: var(--color-text-primary);
		transition: background 0.2s;
	}

	.action-btn:hover {
		background: var(--color-gray-100);
	}

	/* Mobile Adjustments */
	@media (max-width: 640px) {
		.header-actions {
			gap: 0.25rem;
		}

		.action-btn {
			padding: 0.375rem;
		}
	}
</style>
