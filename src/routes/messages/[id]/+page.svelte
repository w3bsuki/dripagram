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

	// Log what we received
	console.log('Messages page data:', data);
	console.log('Conversation object:', data.conversation);
	console.log('Other user:', data.conversation?.other_user);

	// Don't check for required data yet - let's see what we get
	let messages = $state(data.messages || []);
	let newMessage = $state('');
	let typingUsers = $state<string[]>([]);
	let isOnline = $state(false);
	let loading = $state(false);
	let sending = $state(false);
	let messagesContainer = $state<HTMLDivElement>();
	
	const conversation = data.conversation;
	const messageService = data.user && data.conversationId && conversation ? createMessageService({
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
		console.log('Component mounted, messageService:', !!messageService);
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
		if (!messageService || !data.user) return;
		
		// Subscribe to new messages
		unsubscribeMessages = messageService.subscribeToMessages((message) => {
			messages = [...messages, message];
			scrollToBottom();
			
			// Mark as read if from other user
			if (message.sender_id !== data.user!.id) {
				messageService!.markAsRead([message.id]);
			}
		});

		// Subscribe to message status updates
		unsubscribeStatus = messageService.subscribeToStatusUpdates((updatedMessage) => {
			messages = messages.map((msg: any) => 
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
		console.log('handleSend called');
		console.log('newMessage:', newMessage);
		console.log('sending:', sending);
		console.log('messageService:', !!messageService);
		console.log('data.user:', !!data.user);
		
		if (!newMessage.trim() || sending || !messageService || !data.user) {
			console.log('Early return from handleSend');
			return;
		}

		const messageContent = newMessage.trim();
		console.log('Sending message:', messageContent);
		newMessage = '';
		sending = true;

		// Optimistic update
		const tempMessage = {
			id: crypto.randomUUID(),
			conversation_id: data.conversationId!,
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
		console.log('Calling messageService.sendMessage...');
		const sentMessage = await messageService.sendMessage(messageContent);
		console.log('sendMessage result:', sentMessage);
		
		if (sentMessage) {
			// Replace temp message with real one
			console.log('Message sent successfully, replacing temp message');
			messages = messages.map((msg: any) => 
				msg.id === tempMessage.id ? sentMessage : msg
			);
		} else {
			// Remove temp message on error
			console.log('Message sending failed, removing temp message');
			messages = messages.filter((msg: any) => msg.id !== tempMessage.id);
		}
		
		sending = false;
		console.log('handleSend completed');
	}

	function handleTyping(isTyping: boolean) {
		if (messageService) {
			messageService.setTyping(isTyping);
		}
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
		const grouped = new Map<string, any[]>();
		
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

<!-- Modern conversation view with proper viewport handling -->
<div class="conversation-view">
	{#if conversation?.other_user}
		<ChatHeader
			otherUser={conversation.other_user}
			{isOnline}
			product={conversation.product}
			onBack={handleBack}
			onProfileClick={() => goto(`/user/${conversation.other_user?.username}`)}
		/>
	{:else}
		<!-- Fallback header -->
		<div class="fallback-header">
			<button onclick={handleBack}>← Back</button>
			<h2>Loading conversation...</h2>
		</div>
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

	<div class="input-area">
		<MessageInput
			bind:value={newMessage}
			onSend={handleSend}
			onTyping={handleTyping}
			disabled={sending}
			{typingUsers}
			placeholder={conversation?.product 
				? `Ask about ${(conversation.product as any).title}...` 
				: 'Type a message...'}
		/>
	</div>
</div>

<style>
	.conversation-view {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 56px); /* Account for header */
		background: #ffffff;
		position: relative;
	}

	.fallback-header {
		display: flex;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #e5e7eb;
		gap: 1rem;
		background: #ffffff;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.fallback-header button {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #374151;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem 1rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: #ffffff;
		min-height: 0; /* Allow flex item to shrink */
	}

	.input-area {
		position: sticky;
		bottom: 0;
		background: #ffffff;
		border-top: 1px solid #e5e7eb;
		z-index: 20;
		flex-shrink: 0;
	}

	/* Modern scrollbar styling */
	.messages-container::-webkit-scrollbar {
		width: 4px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 2px;
	}

	.messages-container::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}

	/* Typing indicator bubble */
	.typing-bubble {
		align-self: flex-start;
		background: #f3f4f6;
		border-radius: 20px;
		padding: 12px 16px;
		margin: 8px 0 8px 48px;
		animation: fadeInUp 0.3s ease-out;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.typing-dots {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.typing-dots span {
		width: 8px;
		height: 8px;
		background: #9ca3af;
		border-radius: 50%;
		animation: typingPulse 1.4s infinite ease-in-out;
	}

	.typing-dots span:nth-child(1) {
		animation-delay: 0s;
	}

	.typing-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.typing-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes typingPulse {
		0%, 60%, 100% {
			transform: scale(0.8);
			opacity: 0.4;
		}
		30% {
			transform: scale(1.1);
			opacity: 1;
		}
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.conversation-view {
			height: calc(100vh - 56px);
		}
		
		.messages-container {
			padding: 0.75rem 0.75rem 0.5rem;
		}
	}

	/* Dark mode support (optional) */
	@media (prefers-color-scheme: dark) {
		.conversation-view {
			background: #1f2937;
		}
		
		.fallback-header {
			background: #1f2937;
			border-bottom-color: #374151;
		}
		
		.messages-container {
			background: #1f2937;
		}
		
		.input-area {
			background: #1f2937;
			border-top-color: #374151;
		}
		
		.typing-bubble {
			background: #374151;
		}
	}
</style>