<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database.types';
	import ConversationList from '$lib/components/messages/ConversationList.svelte';
	import type { Conversation } from '$lib/types/messaging';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const supabase = getContext<SupabaseClient<Database>>('supabase');
	const auth = getAuthContext();

	let conversations = $state<Conversation[]>(data.conversations || []);
	let loading = $state(false);
	let searchQuery = $state('');

	onMount(() => {
		const cleanup = setupRealtime();
		return cleanup;
	});

	async function refreshConversations() {
		if (!data.user) return;
		
		loading = true;
		try {
			// Refresh the page to get new server data
			await goto('/messages', { replaceState: true, invalidateAll: true });
		} finally {
			loading = false;
		}
	}

	function setupRealtime() {
		if (!data.user) return;

		const channel = supabase
			.channel('conversations')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () =>
				refreshConversations()
			)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () =>
				refreshConversations()
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}

	function handleConversationClick(conversationId: string) {
		goto(`/messages/${conversationId}`);
	}

	function handleBack() {
		goto('/');
	}

	function handleCompose() {
	}

	function handleSearchChange(query: string) {
		searchQuery = query;
	}
</script>

<svelte:head>
	<title>Messages - Driplo</title>
</svelte:head>

<ConversationList
	{conversations}
	{loading}
	{searchQuery}
	currentUserId={data.user?.id}
	username={data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || 'Messages'}
	onConversationClick={handleConversationClick}
	onBack={handleBack}
	onCompose={handleCompose}
	onSearchChange={handleSearchChange}
/>
