<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Users from '@lucide/svelte/icons/users';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Star from '@lucide/svelte/icons/star';
	import Clock from '@lucide/svelte/icons/clock';
	import Zap from '@lucide/svelte/icons/zap';
	import { liveShoppingService, type LiveSession, type LiveMessage } from '$lib/services/live-shopping';
	import { gamificationService } from '$lib/services/gamification';
	import Button from '$lib/components/ui/button';
	import { toast } from '$lib/utils/toast';

	let { 
		session, 
		showChat = true, 
		autoJoin = false,
		onPurchase
	} = $props<{
		session: LiveSession;
		showChat?: boolean;
		autoJoin?: boolean;
		onPurchase?: (productId: string) => void;
	}>();

	// Reactive state
	let isJoined = $state(false);
	let isLoading = $state(false);
	let messages = $state<LiveMessage[]>([]);
	let newMessage = $state('');
	let viewerCount = $state(session.viewer_count);
	let socialProof = $state<any>(null);
	let showGroupBuy = $state(false);
	let groupBuyOffer = $state<any>(null);
	let hasLiked = $state(false);
	let isAsking = $state(false);

	// Toast state
	// Toast messages handled by toast utility

	// Auto-join on mount if specified
	onMount(async () => {
		if (autoJoin) {
			await joinSession();
		}
		
		// Load initial data
		await loadMessages();
		await loadSocialProof();
		
		// Listen for real-time updates
		setupRealtimeListeners();
	});

	onDestroy(() => {
		if (isJoined) {
			liveShoppingService.destroy();
		}
	});

	async function joinSession() {
		if (isJoined) return;
		
		isLoading = true;
		try {
			await liveShoppingService.joinSession(session.id);
			isJoined = true;
			showToastMessage('Joined live session! 🎉', 'success');
			
			// Award points for joining
			await gamificationService.awardPoints({
				type: 'product_liked', // Using generic type for live session engagement
				user_id: 'current',
				points_earned: 10,
				multiplier_applied: 1,
				metadata: { action: 'joined_live_session', session_id: session.id }
			});
		} catch (error) {
			console.error('Failed to join session:', error);
			showToastMessage('Failed to join session', 'error');
		} finally {
			isLoading = false;
		}
	}

	async function sendMessage() {
		if (!newMessage.trim() || !isJoined) return;
		
		try {
			await liveShoppingService.sendMessage(newMessage);
			newMessage = '';
			
			// Award points for participation
			await gamificationService.awardPoints({
				type: 'product_liked',
				user_id: 'current', 
				points_earned: 5,
				multiplier_applied: 1,
				metadata: { action: 'sent_message', session_id: session.id }
			});
		} catch (error) {
			console.error('Failed to send message:', error);
			showToastMessage('Failed to send message', 'error');
		}
	}

	async function askQuestion() {
		if (!newMessage.trim() || !isJoined) return;
		
		isAsking = true;
		try {
			await liveShoppingService.askQuestion(newMessage);
			newMessage = '';
			showToastMessage('Question sent! The seller will respond shortly.', 'success');
			
			// Award more points for asking questions
			await gamificationService.awardPoints({
				type: 'product_liked',
				user_id: 'current',
				points_earned: 15,
				multiplier_applied: 1,
				metadata: { action: 'asked_question', session_id: session.id }
			});
		} catch (error) {
			console.error('Failed to ask question:', error);
			showToastMessage('Failed to send question', 'error');
		} finally {
			isAsking = false;
		}
	}

	async function likeSession() {
		if (hasLiked) return;
		
		try {
			// This would typically call a like API
			hasLiked = true;
			showToastMessage('Liked! ❤️', 'success');
			
			await gamificationService.awardPoints({
				type: 'product_liked',
				user_id: 'current',
				points_earned: 5,
				multiplier_applied: 1,
				metadata: { action: 'liked_session', session_id: session.id }
			});
		} catch (error) {
			console.error('Failed to like session:', error);
		}
	}

	async function shareSession() {
		try {
			if (navigator.share) {
				await navigator.share({
					title: session.title,
					text: `Check out this live shopping session: ${session.title}`,
					url: window.location.href
				});
			} else {
				await navigator.clipboard.writeText(window.location.href);
				showToastMessage('Link copied to clipboard! 📋', 'success');
			}
			
			await gamificationService.awardPoints({
				type: 'product_liked',
				user_id: 'current',
				points_earned: 25,
				multiplier_applied: 1,
				metadata: { action: 'shared_session', session_id: session.id }
			});
		} catch (error) {
			console.error('Failed to share:', error);
		}
	}

	async function joinGroupBuy() {
		if (!groupBuyOffer) return;
		
		try {
			const result = await liveShoppingService.joinGroupBuying(groupBuyOffer.id);
			if (result.success) {
				showToastMessage(`Joined group buy! ${result.participants} participants so far 🛍️`, 'success');
				groupBuyOffer.current_participants = result.participants;
			} else {
				showToastMessage('Already participating in group buy!', 'error');
			}
		} catch (error) {
			console.error('Failed to join group buy:', error);
			showToastMessage('Failed to join group buy', 'error');
		}
	}

	async function purchaseProduct() {
		try {
			if (onPurchase) {
				await onPurchase(session.product_id);
				showToastMessage('Purchase initiated! 🛒', 'success');
				
				await gamificationService.awardPoints({
					type: 'sale_completed',
					user_id: 'current',
					points_earned: 100,
					multiplier_applied: 1.5, // Bonus for live purchases
					metadata: { action: 'live_purchase', session_id: session.id, product_id: session.product_id }
				});
			}
		} catch (error) {
			console.error('Failed to purchase:', error);
			showToastMessage('Purchase failed', 'error');
		}
	}

	async function loadMessages() {
		try {
			const sessionMessages = await liveShoppingService.getSessionMessages(session.id, 50);
			messages = sessionMessages.reverse(); // Show oldest first
		} catch (error) {
			console.error('Failed to load messages:', error);
		}
	}

	async function loadSocialProof() {
		if (!session.product?.id) return;
		
		try {
			const proof = await liveShoppingService.getSocialProofMetrics(session.product.id);
			socialProof = proof;
		} catch (error) {
			console.error('Failed to load social proof:', error);
		}
	}

	function setupRealtimeListeners() {
		// Listen for new messages
		window.addEventListener('liveChatMessage', (event: any) => {
			const message = event.detail as LiveMessage;
			messages = [...messages, message];
			scrollChatToBottom();
		});

		// Listen for session updates
		window.addEventListener('liveSessionUpdate', (event: any) => {
			const updatedSession = event.detail as LiveSession;
			viewerCount = updatedSession.viewer_count;
		});
	}

	function scrollChatToBottom() {
		// Scroll chat to bottom after a short delay
		setTimeout(() => {
			const chatContainer = document.getElementById('chat-messages');
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);
	}

	function formatTime(timestamp: string): string {
		return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function getMessageTypeColor(type: string): string {
		switch (type) {
			case 'question': return 'text-blue-600';
			case 'system': return 'text-green-600';
			case 'purchase': return 'text-purple-600';
			default: return 'text-gray-800';
		}
	}

	function showToastMessage(message: string, type: 'success' | 'error') {
		if (type === 'success') {
			toast.success(message);
		} else {
			toast.error(message);
		}
	}

	// Handle Enter key in message input
	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="live-shopping-container">
	<!-- Live Session Header -->
	<div class="session-header">
		<div class="session-info">
			<div class="live-indicator">
				<span class="live-dot"></span>
				LIVE
			</div>
			<h2 class="session-title">{session.title}</h2>
			<div class="viewer-count">
				<Users size={16} />
				{viewerCount} watching
			</div>
		</div>

		<div class="session-actions">
			<button class="action-btn like-btn {hasLiked ? 'liked' : ''}" onclick={likeSession}>
				<Heart size={20} fill={hasLiked ? 'red' : 'none'} color={hasLiked ? 'red' : 'currentColor'} />
			</button>
			<button class="action-btn" onclick={shareSession}>
				<Share2 size={20} />
			</button>
		</div>
	</div>

	<!-- Product Info with Social Proof -->
	{#if session.product}
		<div class="product-showcase">
			<div class="product-image">
				<img src={session.product.images[0]} alt={session.product.title} />
				
				<!-- Social Proof Overlays -->
				{#if socialProof?.recent_purchases > 0}
					<div class="social-proof recent-purchases">
						<ShoppingBag size={14} />
						{socialProof.recent_purchases} bought recently
					</div>
				{/if}

				{#if socialProof?.trending_rank}
					<div class="social-proof trending">
						<Zap size={14} />
						#{socialProof.trending_rank} Trending
					</div>
				{/if}
			</div>

			<div class="product-details">
				<h3 class="product-title">{session.product.title}</h3>
				<div class="product-price">{session.product.price}лв</div>
				
				{#if socialProof?.interest_score}
					<div class="interest-score">
						<Star size={16} />
						{socialProof.interest_score} interest points
					</div>
				{/if}

				<!-- Group Buy Offer -->
				{#if groupBuyOffer}
					<div class="group-buy-offer">
						<div class="group-buy-header">
							<span class="group-buy-icon">🎯</span>
							Group Buy Active!
						</div>
						<p class="group-buy-details">
							Get {groupBuyOffer.discount_percentage}% off when {groupBuyOffer.min_quantity} people join
						</p>
						<div class="group-buy-progress">
							<div class="progress-bar">
								<div class="progress-fill" style="width: {(groupBuyOffer.current_participants / groupBuyOffer.min_quantity) * 100}%"></div>
							</div>
							<span class="progress-text">
								{groupBuyOffer.current_participants} / {groupBuyOffer.min_quantity} joined
							</span>
						</div>
						<Button onclick={joinGroupBuy} class="group-buy-btn">
							Join Group Buy
						</Button>
					</div>
				{/if}

				<div class="purchase-section">
					{#if !isJoined}
						<Button onclick={joinSession} disabled={isLoading} class="join-btn">
							{isLoading ? 'Joining...' : 'Join Live Session'}
						</Button>
					{:else}
						<Button onclick={purchaseProduct} class="purchase-btn">
							Buy Now - {session.product.price}лв
						</Button>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Live Chat Section -->
	{#if showChat && isJoined}
		<div class="chat-section">
			<div class="chat-header">
				<MessageCircle size={20} />
				Live Chat
				<span class="message-count">({messages.length})</span>
			</div>

			<div class="chat-messages" id="chat-messages">
				{#each messages as message}
					<div class="message {message.message_type}">
						<div class="message-header">
							<span class="username">{message.user?.username || 'Anonymous'}</span>
							<span class="timestamp">{formatTime(message.created_at)}</span>
						</div>
						<div class="message-content {getMessageTypeColor(message.message_type)}">
							{message.message}
						</div>
					</div>
				{/each}
			</div>

			<div class="chat-input-section">
				<div class="message-input-wrapper">
					<textarea
						bind:value={newMessage}
						onkeypress={handleKeyPress}
						placeholder="Join the conversation..."
						class="message-input"
						rows={2}
					></textarea>
					<div class="input-actions">
						<Button onclick={sendMessage} disabled={!newMessage.trim()} size="sm">
							Send
						</Button>
						<Button onclick={askQuestion} disabled={!newMessage.trim() || isAsking} variant="outline" size="sm">
							{isAsking ? 'Asking...' : 'Ask Question'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Session Stats -->
	<div class="session-stats">
		<div class="stat-item">
			<Users size={16} />
			<span>{viewerCount} viewers</span>
		</div>
		<div class="stat-item">
			<MessageCircle size={16} />
			<span>{messages.length} messages</span>
		</div>
		<div class="stat-item">
			<Clock size={16} />
			<span>Started {formatTime(session.started_at || session.created_at)}</span>
		</div>
	</div>
</div>

<!-- Toast notifications handled by global toast utility -->

<style>
	.live-shopping-container {
		max-width: 800px;
		margin: 0 auto;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	/* Session Header */
	.session-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: linear-gradient(135deg, #e60023 0%, #ff4458 100%);
		color: white;
	}

	.session-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.live-dot {
		width: 8px;
		height: 8px;
		background: #00ff00;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.session-title {
		font-size: 1.125rem;
		font-weight: 700;
		margin: 0;
	}

	.viewer-count {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.9;
	}

	.session-actions {
		display: flex;
		gap: 0.5rem;
	}

	.action-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: white;
		padding: 0.5rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.like-btn.liked {
		background: rgba(255, 255, 255, 0.9);
		color: #e60023;
	}

	/* Product Showcase */
	.product-showcase {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.product-image {
		position: relative;
		aspect-ratio: 1;
		border-radius: 12px;
		overflow: hidden;
	}

	.product-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.social-proof {
		position: absolute;
		top: 12px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.social-proof.recent-purchases {
		left: 12px;
		background: rgba(34, 197, 94, 0.9);
	}

	.social-proof.trending {
		right: 12px;
		background: rgba(251, 191, 36, 0.9);
	}

	.product-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.product-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
	}

	.product-price {
		font-size: 1.75rem;
		font-weight: 800;
		color: #e60023;
	}

	.interest-score {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #f59e0b;
		font-weight: 600;
	}

	/* Group Buy Offer */
	.group-buy-offer {
		background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
		color: white;
		padding: 1rem;
		border-radius: 12px;
		margin: 1rem 0;
	}

	.group-buy-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.group-buy-details {
		font-size: 0.875rem;
		opacity: 0.9;
		margin: 0.5rem 0;
	}

	.group-buy-progress {
		margin: 1rem 0;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}

	.progress-fill {
		height: 100%;
		background: white;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.group-buy-btn {
		background: white;
		color: #8b5cf6;
		border: none;
		font-weight: 600;
	}

	.purchase-section {
		margin-top: auto;
	}

	.join-btn, .purchase-btn {
		width: 100%;
		padding: 1rem;
		font-size: 1rem;
		font-weight: 700;
	}

	.join-btn {
		background: #10b981;
		color: white;
	}

	.purchase-btn {
		background: #e60023;
		color: white;
	}

	/* Chat Section */
	.chat-section {
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.chat-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem 0.5rem;
		font-weight: 600;
		color: #374151;
	}

	.message-count {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.chat-messages {
		max-height: 300px;
		overflow-y: auto;
		padding: 0 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.message {
		background: white;
		padding: 0.75rem;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.message.system {
		background: #f0f9f0;
		border-color: #10b981;
		color: #065f46;
		text-align: center;
		font-weight: 500;
	}

	.message.question {
		background: #eff6ff;
		border-color: #3b82f6;
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.username {
		font-weight: 600;
		color: #1f2937;
		font-size: 0.875rem;
	}

	.timestamp {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.message-content {
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Chat Input */
	.chat-input-section {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
		background: white;
	}

	.message-input-wrapper {
		display: flex;
		gap: 0.75rem;
		align-items: end;
	}

	.message-input {
		flex: 1;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 0.75rem;
		resize: none;
		font-family: inherit;
		font-size: 0.875rem;
		background: white;
	}

	.message-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.input-actions {
		display: flex;
		gap: 0.5rem;
	}

	/* Session Stats */
	.session-stats {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border-top: 1px solid #e5e7eb;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.product-showcase {
			grid-template-columns: 1fr;
		}
		
		.session-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}
		
		.session-info {
			width: 100%;
		}
		
		.session-actions {
			align-self: flex-end;
		}

		.chat-messages {
			max-height: 200px;
		}
	}
</style>