<script lang="ts">
	import { ArrowLeft, Search, Edit2, Phone, Video, MoreVertical, Check, CheckCheck } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import type { Conversation } from '$lib/types/messaging';
	import { cn } from '$lib/utils';
	import * as m from '$lib/paraglide/messages';

	interface Props {
		conversations: Conversation[];
		loading: boolean;
		searchQuery: string;
		currentUserId?: string;
		username?: string;
		onConversationClick: (id: string) => void;
		onSearchChange: (query: string) => void;
		onBack: () => void;
		onCompose: () => void;
	}

	let {
		conversations,
		loading,
		searchQuery,
		currentUserId,
		username,
		onConversationClick,
		onSearchChange,
		onBack,
		onCompose
	}: Props = $props();

	let activeFilter = $state<'all' | 'unread' | 'requests'>('all');
	let showSearch = $state(false);

	// Filter conversations based on active filter
	let filteredConversations = $derived(() => {
		let filtered = conversations;

		// Apply search filter
		if (searchQuery) {
			filtered = filtered.filter(conv =>
				conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Apply status filter
		switch (activeFilter) {
			case 'unread':
				return filtered.filter(conv => conv.unread_count > 0);
			case 'requests':
				// Message requests would be conversations without a reply yet
				return filtered.filter(conv => !conv.last_message || conv.last_message.sender_id !== currentUserId);
			default:
				return filtered;
		}
	});

	function formatTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		
		if (diffHours < 1) {
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			return diffMinutes < 1 ? m['messages.now']() : m['messages.minutes_ago']({count: diffMinutes});
		}
		if (diffHours < 24) {
			return m['messages.hours_ago']({count: diffHours});
		}
		if (diffHours < 168) { // Less than a week
			const diffDays = Math.floor(diffHours / 24);
			return m['messages.days_ago']({count: diffDays});
		}
		const diffWeeks = Math.floor(diffHours / 168);
		return m['messages.weeks_ago']({count: diffWeeks});
	}

	function getMessagePreview(message: any): string {
		if (!message) return m['messages.start_conversation']();
		
		if (message.message_type === 'product_inquiry') {
			return m['messages.asked_about_product']();
		}
		
		if (message.content) {
			return message.content.length > 40 
				? message.content.substring(0, 40) + '...'
				: message.content;
		}
		
		return m['messages.sent_message']();
	}

	function toggleSearch() {
		showSearch = !showSearch;
		if (!showSearch) {
			onSearchChange('');
		}
	}
</script>

<div class="inbox-container">
	<!-- Header -->
	<header class="inbox-header">
		<div class="header-top">
			<button class="icon-btn" onclick={onBack} aria-label={m['messages.go_back']()}>
				<ArrowLeft size={24} />
			</button>
			
			<h1 class="header-title">{username || m['messages.title']().split(' - ')[0]}</h1>
			
			<div class="header-actions">
				<button class="icon-btn" onclick={toggleSearch} aria-label={m['messages.search']()}>
					<Search size={22} />
				</button>
				<button class="icon-btn" onclick={onCompose} aria-label={m['messages.compose']()}>
					<Edit2 size={22} />
				</button>
			</div>
		</div>

		<!-- Search Bar -->
		{#if showSearch}
			<div class="search-container">
				<Search size={18} class="search-icon" />
				<input
					type="text"
					placeholder={m['messages.search_messages']()}
					class="search-input"
					value={searchQuery}
					oninput={(e) => onSearchChange(e.currentTarget.value)}
					autofocus
				/>
			</div>
		{/if}

		<!-- Filter Tabs -->
		<div class="filter-tabs">
			<button 
				class={cn("filter-tab", activeFilter === 'all' && "active")}
				onclick={() => activeFilter = 'all'}
			>
				{m['messages.all']()}
			</button>
			<button 
				class={cn("filter-tab", activeFilter === 'unread' && "active")}
				onclick={() => activeFilter = 'unread'}
			>
				{m['messages.unread']()}
				{#if conversations.some(c => c.unread_count > 0)}
					<span class="badge">{conversations.reduce((sum, c) => sum + c.unread_count, 0)}</span>
				{/if}
			</button>
			<button 
				class={cn("filter-tab", activeFilter === 'requests' && "active")}
				onclick={() => activeFilter = 'requests'}
			>
				{m['messages.requests']()}
			</button>
		</div>
	</header>

	<!-- Conversations List -->
	<div class="conversations-list">
		{#if loading}
			<!-- Loading Skeleton -->
			{#each Array(6) as _, i}
				<div class="conversation-skeleton">
					<div class="skeleton-avatar"></div>
					<div class="skeleton-content">
						<div class="skeleton-line short"></div>
						<div class="skeleton-line long"></div>
					</div>
				</div>
			{/each}
		{:else if filteredConversations().length === 0}
			<!-- Empty State -->
			<div class="empty-state">
				<div class="empty-icon">💬</div>
				<h3>{m['messages.no_conversations']()}</h3>
				<p>{m['messages.start_chat']()}</p>
				<button class="btn-primary" onclick={onCompose}>
					{m['browse.title']().split(' - ')[0]}
				</button>
			</div>
		{:else}
			<!-- Conversation Items -->
			{#each filteredConversations() as conversation (conversation.id)}
				<button 
					class="conversation-item"
					onclick={() => onConversationClick(conversation.id)}
				>
					<!-- Avatar -->
					<div class="avatar-container">
						<img 
							src={conversation.other_user.avatar_url} 
							alt={conversation.other_user.username}
							class="avatar"
						/>
						{#if conversation.other_user.verified}
							<div class="verified-badge">✓</div>
						{/if}
					</div>

					<!-- Content -->
					<div class="conversation-content">
						<div class="conversation-header">
							<span class="username">
								{conversation.other_user.username}
								{#if conversation.other_user.verified}
									<span class="verified-text">✓</span>
								{/if}
							</span>
							<span class="timestamp">
								{conversation.last_message 
									? formatTime(conversation.last_message.created_at)
									: ''}
							</span>
						</div>
						
						<div class="conversation-preview">
							<span class={cn(
								"message-text",
								conversation.unread_count > 0 && "unread"
							)}>
								{#if conversation.last_message?.sender_id === currentUserId}
									<span class="sent-indicator">{m['messages.you']()} </span>
								{/if}
								{getMessagePreview(conversation.last_message)}
							</span>
							
							{#if conversation.unread_count > 0}
								<span class="unread-badge">{conversation.unread_count}</span>
							{:else if conversation.last_message?.sender_id === currentUserId}
								<span class="status-icon">
									<Check size={16} />
								</span>
							{/if}
						</div>

						<!-- Product Preview (if applicable) -->
						{#if conversation.product}
							<div class="product-preview">
								<span class="product-label">{m['profile.about']()}:</span>
								<span class="product-title">{conversation.product.title}</span>
								<span class="product-price">{conversation.product.price}лв</span>
							</div>
						{/if}
					</div>
				</button>
			{/each}
		{/if}
	</div>

	<!-- Mobile Bottom Navigation -->
	<BottomNav />
</div>

<style>
	.inbox-container {
		min-height: 100vh;
		background: #fafafa;
		padding-bottom: 80px; /* Space for bottom nav */
	}

	/* Header */
	.inbox-header {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		height: 60px;
	}

	.header-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
		margin: 0;
		flex: 1;
		text-align: center;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.icon-btn {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 50%;
		cursor: pointer;
		color: #111827;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-btn:hover {
		background: #f3f4f6;
	}

	.icon-btn:active {
		transform: scale(0.95);
	}

	/* Search */
	.search-container {
		padding: 0 1rem 0.75rem;
		position: relative;
	}

	.search-input {
		width: 100%;
		padding: 0.625rem 1rem 0.625rem 2.5rem;
		background: #f3f4f6;
		border: none;
		border-radius: 20px;
		font-size: 0.9375rem;
		outline: none;
		transition: background 0.2s;
	}

	.search-input:focus {
		background: #e5e7eb;
	}

	.search-icon {
		position: absolute;
		left: 1.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #6b7280;
		pointer-events: none;
	}

	/* Filter Tabs */
	.filter-tabs {
		display: flex;
		gap: 1.5rem;
		padding: 0 1rem 0.75rem;
		border-bottom: 1px solid #f3f4f6;
	}

	.filter-tab {
		background: none;
		border: none;
		padding: 0.5rem 0;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #6b7280;
		cursor: pointer;
		position: relative;
		transition: color 0.2s;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.filter-tab.active {
		color: #111827;
	}

	.filter-tab.active::after {
		content: '';
		position: absolute;
		bottom: -0.75rem;
		left: 0;
		right: 0;
		height: 2px;
		background: #2563eb;
	}

	.badge {
		background: #ef4444;
		color: white;
		padding: 0.125rem 0.375rem;
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 18px;
		text-align: center;
	}

	/* Conversations List */
	.conversations-list {
		background: white;
		min-height: calc(100vh - 200px);
	}

	.conversation-item {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: background 0.2s;
		border-bottom: 1px solid #f9fafb;
	}

	.conversation-item:hover {
		background: #f9fafb;
	}

	.conversation-item:active {
		background: #f3f4f6;
	}

	/* Avatar */
	.avatar-container {
		position: relative;
		flex-shrink: 0;
	}

	.avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.verified-badge {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 20px;
		height: 20px;
		background: #1d9bf0;
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: bold;
		border: 2px solid white;
	}

	/* Content */
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
		font-weight: 600;
		font-size: 0.9375rem;
		color: #111827;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.verified-text {
		color: #1d9bf0;
		font-size: 0.875rem;
	}

	.timestamp {
		font-size: 0.8125rem;
		color: #9ca3af;
	}

	.conversation-preview {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.message-text {
		font-size: 0.875rem;
		color: #6b7280;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.message-text.unread {
		font-weight: 600;
		color: #111827;
	}

	.sent-indicator {
		color: #9ca3af;
		font-weight: 400;
	}

	.unread-badge {
		background: #2563eb;
		color: white;
		padding: 0.125rem 0.375rem;
		border-radius: 10px;
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 18px;
		text-align: center;
		flex-shrink: 0;
	}

	.status-icon {
		color: #9ca3af;
		flex-shrink: 0;
	}

	.status-icon :global(.read) {
		color: #2563eb;
	}

	/* Product Preview */
	.product-preview {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.375rem;
		padding: 0.375rem 0.5rem;
		background: #f9fafb;
		border-radius: 6px;
		font-size: 0.8125rem;
	}

	.product-label {
		color: #6b7280;
	}

	.product-title {
		color: #111827;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.product-price {
		color: #2563eb;
		font-weight: 600;
	}

	/* Loading Skeleton */
	.conversation-skeleton {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid #f9fafb;
	}

	.skeleton-avatar {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton 1.5s infinite;
	}

	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 12px;
		border-radius: 4px;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: skeleton 1.5s infinite;
	}

	.skeleton-line.short {
		width: 30%;
	}

	.skeleton-line.long {
		width: 70%;
	}

	@keyframes skeleton {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		min-height: 400px;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		opacity: 0.7;
	}

	.empty-state h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin: 0 0 0.5rem;
	}

	.empty-state p {
		font-size: 0.875rem;
		color: #6b7280;
		margin: 0 0 1.5rem;
		max-width: 280px;
	}

	.btn-primary {
		background: #2563eb;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 10px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover {
		background: #1d4ed8;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	/* Responsive */
	@media (min-width: 768px) {
		.inbox-container {
			max-width: 600px;
			margin: 0 auto;
			padding-bottom: 0;
		}

		.conversations-list {
			min-height: calc(100vh - 140px);
		}
	}
</style>