<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/supabase/types';
	import ChatContainer from '$lib/components/messages/ChatContainer.svelte';
	import type { Conversation, Message } from '$lib/types/messaging';
	import { getAuthContext } from '$lib/stores/auth.svelte';

	const supabase = getContext<SupabaseClient<Database>>('supabase');
	const auth = getAuthContext();

	let conversation = $state<Conversation | null>(null);
	let messages = $state<Message[]>([]);
	let loading = $state(true);
	let newMessage = $state('');

	const conversationId = $page.params.id;
	let realtimeChannel: any;

	onMount(async () => {
		await loadConversation();
		await loadMessages();
		setupRealtime();
		markMessagesAsRead();
	});

	onDestroy(() => {
		if (realtimeChannel) {
			supabase.removeChannel(realtimeChannel);
		}
	});

	async function loadConversation() {
		if (!auth.user) return;

		try {
			const { data, error } = await supabase
				.from('conversations')
				.select(
					`
          *,
          buyer:profiles!buyer_id(id, username, avatar_url, verified),
          seller:profiles!seller_id(id, username, avatar_url, verified),
          product:listings(id, title, price, images)
        `
				)
				.eq('id', conversationId)
				.single();

			if (error) throw error;

			// Check if user is part of conversation
			if (data.buyer_id !== auth.user.id && data.seller_id !== auth.user.id) {
				goto('/messages');
				return;
			}

			const otherUser = data.buyer_id === auth.user.id ? data.seller : data.buyer;

			conversation = {
				...data,
				other_user: otherUser,
			};
		} catch (error) {
			console.error('Error loading conversation:', error);
			goto('/messages');
		}
	}

	async function loadMessages() {
		try {
			const { data, error } = await supabase
				.from('messages')
				.select('*')
				.eq('conversation_id', conversationId)
				.is('deleted_at', null)
				.order('created_at', { ascending: true });

			if (error) throw error;

			messages = data || [];
		} catch (error) {
			console.error('Error loading messages:', error);
		} finally {
			loading = false;
		}
	}

	function setupRealtime() {
		realtimeChannel = supabase
			.channel('messages')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'messages',
					filter: `conversation_id=eq.${conversationId}`,
				},
				(payload) => {
					messages = [...messages, payload.new as Message];

					// Mark as read if not from current user
					if (payload.new.sender_id !== auth.user?.id) {
						markMessageAsRead(payload.new.id);
					}
				}
			)
			.subscribe();
	}

	async function sendMessage() {
		if (!newMessage.trim() || !auth.user || !conversation) return;

		// Check if user has messaging permissions
		const canMessage = await checkMessagingPermissions();
		if (!canMessage) {
			// Show upgrade modal or redirect to subscription
			alert('Upgrade to Premium to send messages!');
			return;
		}

		try {
			const { error } = await supabase.from('messages').insert({
				conversation_id: conversationId,
				sender_id: auth.user.id,
				content: newMessage.trim(),
				message_type: 'text',
			});

			if (error) throw error;

			newMessage = '';
		} catch (error) {
			console.error('Error sending message:', error);
		}
	}

	async function checkMessagingPermissions(): Promise<boolean> {
		if (!auth.user) return false;

		try {
			const { data } = await supabase.rpc('user_can_message', { user_id: auth.user.id });

			return data || false;
		} catch (error) {
			console.error('Error checking permissions:', error);
			return false;
		}
	}

	async function markMessagesAsRead() {
		if (!auth.user) return;

		const unreadMessages = messages.filter(
			(msg) => !msg.is_read && msg.sender_id !== auth.user?.id
		);

		for (const message of unreadMessages) {
			await markMessageAsRead(message.id);
		}
	}

	async function markMessageAsRead(messageId: string) {
		if (!auth.user) return;

		try {
			await supabase.from('message_reads').upsert({
				message_id: messageId,
				user_id: auth.user.id,
			});

			await supabase
				.from('messages')
				.update({
					is_read: true,
					read_at: new Date().toISOString(),
				})
				.eq('id', messageId);
		} catch (error) {
			console.error('Error marking message as read:', error);
		}
	}

	function handleBack() {
		goto('/messages');
	}

	function handleProfileClick() {
		if (conversation?.other_user) {
			goto(`/@${conversation.other_user.username}`);
		}
	}

	function handleProductClick() {
		if (conversation?.product) {
			goto(`/products/${conversation.product.id}`);
		}
	}

	function handleSendMessage() {
		sendMessage();
	}
</script>

<svelte:head>
	<title>
		{conversation?.other_user.username ? `${conversation.other_user.username} - Messages` : 'Chat'} -
		Driplo
	</title>
</svelte:head>

<ChatContainer
	{conversation}
	{messages}
	{loading}
	bind:newMessage
	currentUserId={auth.user?.id}
	onBack={handleBack}
	onProfileClick={handleProfileClick}
	onProductClick={handleProductClick}
	onSendMessage={handleSendMessage}
/>
