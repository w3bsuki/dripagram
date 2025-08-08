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

	let conversations = $state<Conversation[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');

	onMount(async () => {
		await loadConversations();
		setupRealtime();
	});

	async function loadConversations() {
		if (!data.user) return;

		try {
			const { data: conversationData, error } = await supabase
				.from('conversations')
				.select(
					`
          *,
          buyer:profiles!buyer_id(id, username, avatar_url, verified),
          seller:profiles!seller_id(id, username, avatar_url, verified),
          product:listings(id, title, price, images),
          last_message:messages!inner(
            content, sender_id, created_at, message_type
          )
        `
				)
				.or(`buyer_id.eq.${data.user.id},seller_id.eq.${data.user.id}`)
				.order('last_message_at', { ascending: false });

			if (error) throw error;

			// Process conversations to add other_user and unread_count
			conversations = await Promise.all(
				(conversationData || []).map(async (conv: any) => {
					const otherUser = conv.buyer_id === data.user?.id ? conv.seller : conv.buyer;

					// Get unread count
					const { count } = await supabase
						.from('messages')
						.select('*', { count: 'exact', head: true })
						.eq('conversation_id', conv.id)
						.eq('is_read', false)
						.neq('sender_id', data.user?.id);

					return {
						...conv,
						other_user: otherUser,
						unread_count: count || 0,
						last_message: conv.last_message?.[0],
					};
				})
			);
		} catch (error) {
		} finally {
			loading = false;
		}
	}

	function setupRealtime() {
		if (!data.user) return;

		const channel = supabase
			.channel('conversations')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () =>
				loadConversations()
			)
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () =>
				loadConversations()
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
