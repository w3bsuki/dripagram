<script lang="ts">
	import { Search, Edit, ArrowLeft } from '@lucide/svelte';
	import ConversationItem from './ConversationItem.svelte';
	import ConversationSearch from './ConversationSearch.svelte';
	import MessagesSkeleton from './MessagesSkeleton.svelte';
	import EmptyMessages from './EmptyMessages.svelte';
	import type { ConversationListProps, Conversation } from '$lib/types/messaging';

	let {
		conversations,
		loading,
		onConversationClick,
		onSearchChange,
		searchQuery,
		currentUserId,
		username,
		onBack,
		onCompose,
	} = $props();

	let showSearch = $state(false);

	let filteredConversations = $derived(
		conversations.filter((conv: Conversation) =>
			conv.other_user.username.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function toggleSearch() {
		showSearch = !showSearch;
		if (!showSearch) {
			onSearchChange('');
		}
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		onSearchChange(target.value);
	}
</script>

<div class="messages-page">
	<!-- Header -->
	<header class="messages-header">
		<div class="header-left">
			<button class="back-btn" onclick={onBack}>
				<ArrowLeft size={24} />
			</button>
			<h1 class="page-title">{username || 'Messages'}</h1>
		</div>

		<div class="header-actions">
			<button class="search-btn {showSearch ? 'active' : ''}" onclick={toggleSearch}>
				<Search size={24} />
			</button>
			<button class="compose-btn" onclick={onCompose}>
				<Edit size={24} />
			</button>
		</div>
	</header>

	<!-- Search Bar -->
	{#if showSearch}
		<ConversationSearch bind:value={searchQuery} autofocus={true} />
	{/if}

	<!-- Conversations List -->
	<div class="conversations-container">
		{#if loading}
			<MessagesSkeleton count={8} />
		{:else if filteredConversations.length === 0}
			<EmptyMessages />
		{:else}
			{#each filteredConversations as conversation (conversation.id)}
				<ConversationItem
					{conversation}
					{currentUserId}
					onClick={() => onConversationClick(conversation.id)}
				/>
			{/each}
		{/if}
	</div>
</div>

<style>
	.messages-page {
		min-height: 100vh;
		background: var(--color-background);
		padding-bottom: 80px;
	}

	/* Header */
	.messages-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		color: var(--color-text-primary);
		transition: background 0.2s;
	}

	.back-btn:hover {
		background: var(--color-gray-100);
	}

	.page-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 0.5rem;
	}

	.search-btn,
	.compose-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 8px;
		color: var(--color-text-primary);
		transition: all 0.2s;
	}

	.search-btn:hover,
	.compose-btn:hover {
		background: var(--color-gray-100);
	}

	.search-btn.active {
		color: var(--color-primary);
		background: var(--color-primary-light);
	}

	.conversations-container {
		flex: 1;
	}
</style>
