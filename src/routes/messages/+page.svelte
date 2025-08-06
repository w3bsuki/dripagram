<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/supabase/types';
	import ConversationList from '$lib/components/messages/ConversationList.svelte';
	import type { Conversation } from '$lib/types/messaging';
	import { getAuthContext } from '$lib/stores/auth.svelte';

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
		if (!auth.user) return;

		try {
			const { data, error } = await supabase
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
				.or(`buyer_id.eq.${auth.user.id},seller_id.eq.${auth.user.id}`)
				.order('last_message_at', { ascending: false });

			if (error) throw error;

			// Process conversations to add other_user and unread_count
			conversations = await Promise.all(
				data.map(async (conv: any) => {
					const otherUser = conv.buyer_id === auth.user?.id ? conv.seller : conv.buyer;

					// Get unread count
					const { count } = await supabase
						.from('messages')
						.select('*', { count: 'exact', head: true })
						.eq('conversation_id', conv.id)
						.eq('is_read', false)
						.neq('sender_id', auth.user?.id);

					return {
						...conv,
						other_user: otherUser,
						unread_count: count || 0,
						last_message: conv.last_message?.[0],
					};
				})
			);
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			loading = false;
		}
	}

	function setupRealtime() {
		if (!auth.user) return;

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
		// TODO: Implement compose functionality
		console.log('Compose clicked');
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
	currentUserId={auth.user?.id}
	username={auth.user?.user_metadata?.username || auth.user?.email?.split('@')[0] || 'Messages'}
	onConversationClick={handleConversationClick}
	onBack={handleBack}
	onCompose={handleCompose}
	onSearchChange={handleSearchChange}
/>
