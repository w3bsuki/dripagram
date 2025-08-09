<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/database.types';
	import { createMessageService } from '$lib/services/messageService';
	import ChatHeader from '$lib/components/messages/ChatHeader.svelte';
	import MessageBubble from '$lib/components/messages/MessageBubble.svelte';
	import MessageInput from '$lib/components/messages/MessageInput.svelte';
	import DateSeparator from '$lib/components/messages/DateSeparator.svelte';
	import EmptyMessages from '$lib/components/messages/EmptyMessages.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const supabase = getContext<SupabaseClient<Database>>('supabase');

	// Early return if no data
	if (!data.user || !data.conversation || !data.conversationId) {
		goto('/messages');
	}

	let messages = $state(data.messages || []);
	let newMessage = $state('');
	let typingUsers = $state<string[]>([]);
	let isOnline = $state(false);
	let loading = $state(false);
	let sending = $state(false);
	let messagesContainer = $state<HTMLDivElement>();
	
	const conversation = data.conversation;
	const messageService = data.user && data.conversationId ? createMessageService({
		supabase,
		conversationId: data.conversationId,
		userId: data.user.id
	}) : null;

	// Cleanup subscriptions
	let unsubscribeMessages: (() => void) | null = null;
	let unsubscribeStatus: (() => void) | null = null;
	let unsubscribeTyping: (() => void) | null = null;
	let unsubscribePresence: (() => void) | null = null;

	onMount(() => {
		if (messageService) {
			setupRealtime();
			messageService.markAllAsRead();
			scrollToBottom();
		}
	});

	onDestroy(() => {
		// Cleanup all subscriptions
		unsubscribeMessages?.();
		unsubscribeStatus?.();
		unsubscribeTyping?.();
		unsubscribePresence?.();
		messageService?.cleanup();
	});

	function setupRealtime() {
		// Subscribe to new messages
		unsubscribeMessages = messageService.subscribeToMessages((message) => {
			messages = [...messages, message];
			scrollToBottom();
			
			// Mark as read if from other user
			if (message.sender_id !== data.user.id) {
				messageService.markAsRead([message.id]);
			}
		});

		// Subscribe to message status updates
		unsubscribeStatus = messageService.subscribeToStatusUpdates((updatedMessage) => {
			messages = messages.map(msg => 
				msg.id === updatedMessage.id ? updatedMessage : msg
			);
		});

		// Subscribe to typing indicators
		unsubscribeTyping = messageService.subscribeToTyping(({ user_id, is_typing }) => {
			if (is_typing && conversation?.other_user?.username) {
				if (!typingUsers.includes(conversation.other_user.username)) {
					typingUsers = [...typingUsers, conversation.other_user.username];
				}
			} else if (conversation?.other_user?.username) {
				typingUsers = typingUsers.filter(u => u !== conversation.other_user.username);
			}
		});

		// Subscribe to presence (online status)
		unsubscribePresence = messageService.subscribeToPresence((presenceState) => {
			if (presenceState.event === 'join') {
				isOnline = true;
			} else if (presenceState.event === 'leave') {
				isOnline = false;
			} else if (conversation?.other_user?.id) {
				// Sync event - check if other user is online
				const presences = Object.values(presenceState);
				isOnline = presences.some((p: any) => 
					p.user_id === conversation.other_user.id
				);
			}
		});
	}

	async function handleSend() {
		if (!newMessage.trim() || sending) return;

		const messageContent = newMessage.trim();
		newMessage = '';
		sending = true;

		// Optimistic update
		const tempMessage = {
			id: crypto.randomUUID(),
			conversation_id: data.conversationId,
			sender_id: data.user.id,
			content: messageContent,
			message_type: 'text',
			status: 'sending',
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		};
		
		messages = [...messages, tempMessage];
		scrollToBottom();

		// Send message
		const sentMessage = await messageService.sendMessage(messageContent);
		
		if (sentMessage) {
			// Replace temp message with real one
			messages = messages.map(msg => 
				msg.id === tempMessage.id ? sentMessage : msg
			);
		} else {
			// Remove temp message on error
			messages = messages.filter(msg => msg.id !== tempMessage.id);
		}
		
		sending = false;
	}

	function handleTyping(isTyping: boolean) {
		messageService.setTyping(isTyping);
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (messagesContainer) {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}
		}, 100);
	}

	function handleBack() {
		goto('/messages');
	}

	// Group messages by date
	let messagesByDate = $derived((() => {
		const grouped = new Map<string, typeof messages>();
		
		messages.forEach((msg: any) => {
			const date = new Date(msg.created_at).toDateString();
			if (!grouped.has(date)) {
				grouped.set(date, []);
			}
			grouped.get(date)?.push(msg);
		});
		
		return Array.from(grouped.entries());
	})());

	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		
		if (date.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (date.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return date.toLocaleDateString('en-US', { 
				weekday: 'long', 
				month: 'long', 
				day: 'numeric' 
			});
		}
	}
</script>

<svelte:head>
	<title>{conversation?.other_user?.username || 'Messages'} - Driplo</title>
</svelte:head>

<div class="conversation-view">
	{#if conversation && conversation.other_user}
		<ChatHeader
			user={conversation.other_user}
			{isOnline}
			product={conversation.product}
			onBack={handleBack}
		/>
	{/if}

	<div class="messages-container" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<EmptyMessages />
		{:else}
			{#each messagesByDate as [date, dateMessages]}
				<DateSeparator date={formatDate(date)} />
				{#each dateMessages as message (message.id)}
					<MessageBubble
						{message}
						isOwn={message.sender_id === data.user?.id}
						senderName={message.sender_id === data.user?.id 
							? data.user?.user_metadata?.username || 'You'
							: conversation?.other_user?.username || 'User'}
						senderAvatar={message.sender_id === data.user?.id 
							? data.user?.user_metadata?.avatar_url
							: conversation?.other_user?.avatar_url}
					/>
				{/each}
			{/each}
		{/if}
		
		{#if typingUsers.length > 0}
			<div class="typing-bubble">
				<span class="typing-dots">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</div>
		{/if}
	</div>

	<MessageInput
		bind:value={newMessage}
		onSend={handleSend}
		onTyping={handleTyping}
		disabled={sending}
		{typingUsers}
		placeholder={conversation?.product 
			? `Ask about ${conversation.product.title}...` 
			: 'Type a message...'}
	/>
</div>

<style>
	.conversation-view {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--color-background);
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		padding-bottom: 80px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Custom scrollbar */
	.messages-container::-webkit-scrollbar {
		width: 6px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: var(--color-gray-300);
		border-radius: 3px;
	}

	.messages-container::-webkit-scrollbar-thumb:hover {
		background: var(--color-gray-400);
	}

	/* Typing indicator bubble */
	.typing-bubble {
		align-self: flex-start;
		background: var(--color-gray-100);
		border-radius: 18px;
		padding: 0.75rem 1rem;
		margin-left: 2.5rem;
		animation: fadeIn 0.3s ease;
	}

	.typing-dots {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.typing-dots span {
		width: 8px;
		height: 8px;
		background: var(--color-text-secondary);
		border-radius: 50%;
		animation: typingBounce 1.4s infinite ease-in-out;
	}

	.typing-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.typing-dots span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes typingBounce {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>