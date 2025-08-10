<script lang="ts">
	import { onMount } from 'svelte';
	import ChatHeader from './ChatHeader.svelte';
	import ProductContext from './ProductContext.svelte';
	import MessageBubble from './MessageBubble.svelte';
	import DateSeparator from './DateSeparator.svelte';
	import MessageInput from './MessageInput.svelte';
	import type { Conversation, Message } from '$lib/types/messaging';

	let {
		conversation,
		messages,
		loading,
		currentUserId,
		newMessage = $bindable(),
		onBack,
		onProfileClick,
		onProductClick,
		onSendMessage,
		disabled = false,
	} = $props();

	let messagesContainer = $state<HTMLElement>();

	onMount(() => {
		scrollToBottom();
	});

	$effect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	});

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}

	function formatDate(timestamp: string): string {
		const date = new Date(timestamp);
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
				month: 'short',
				day: 'numeric',
			});
		}
	}

	function shouldShowDateSeparator(currentMsg: Message, prevMsg?: Message): boolean {
		if (!prevMsg) return true;

		const currentDate = new Date(currentMsg.created_at).toDateString();
		const prevDate = new Date(prevMsg.created_at).toDateString();

		return currentDate !== prevDate;
	}

	function handleSendMessage() {
		if (newMessage.trim() && !disabled) {
			onSendMessage();
		}
	}
</script>

<div class="chat-page">
	{#if loading}
		<div class="loading-container">
			<div class="spinner"></div>
		</div>
	{:else if conversation}
		<!-- Chat Header -->
		<ChatHeader otherUser={conversation.other_user} {onBack} {onProfileClick} />

		<!-- Product Context (if conversation is about a specific product) -->
		{#if conversation.product}
			<ProductContext product={conversation.product} {onProductClick} />
		{/if}

		<!-- Messages Container -->
		<div class="messages-container" bind:this={messagesContainer}>
			{#each messages as message, index (message.id)}
				<!-- Date Separator -->
				{#if shouldShowDateSeparator(message, messages[index - 1])}
					<DateSeparator date={formatDate(message.created_at)} />
				{/if}

				<!-- Message -->
				<MessageBubble 
					{message} 
					isFromCurrentUser={message.sender_id === currentUserId}
					otherUser={conversation.other_user}
					{currentUserId}
				/>
			{/each}
		</div>

		<!-- Message Input -->
		<MessageInput bind:value={newMessage} onSend={handleSendMessage} {disabled} />
	{/if}
</div>

<style>
	.chat-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--color-background);
	}

	.loading-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Mobile Adjustments */
	@media (max-width: 640px) {
		.chat-page {
			height: 100vh;
			height: 100dvh; /* Use dynamic viewport height */
		}
	}
</style>
