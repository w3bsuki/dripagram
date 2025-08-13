<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Play from '@lucide/svelte/icons/play';
	import Users from '@lucide/svelte/icons/users';
	import Eye from '@lucide/svelte/icons/eye';
	import Clock from '@lucide/svelte/icons/clock';
	import Star from '@lucide/svelte/icons/star';
	import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
	import Zap from '@lucide/svelte/icons/zap';
	import { liveShoppingService, type LiveSession } from '$lib/services/live-shopping';
	import LiveShopping from './LiveShopping.svelte';
	import Button from '$lib/components/native/Button.svelte';

	// State
	let activeSessions = $state<LiveSession[]>([]);
	let selectedSession = $state<LiveSession | null>(null);
	let isLoading = $state(true);
	let refreshInterval: NodeJS.Timeout | null = null;

	onMount(async () => {
		await loadActiveSessions();
		startAutoRefresh();
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});

	async function loadActiveSessions() {
		try {
			const sessions = await liveShoppingService.getActiveSessions();
			activeSessions = sessions;
		} catch (error) {
			console.error('Failed to load live sessions:', error);
		} finally {
			isLoading = false;
		}
	}

	function startAutoRefresh() {
		// Refresh every 30 seconds
		refreshInterval = setInterval(async () => {
			await loadActiveSessions();
		}, 30000);
	}

	function joinSession(session: LiveSession) {
		selectedSession = session;
	}

	function closeSession() {
		selectedSession = null;
	}

	function formatDuration(startedAt: string): string {
		const start = new Date(startedAt);
		const now = new Date();
		const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
		
		if (diffMinutes < 1) return 'Just started';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		
		const diffHours = Math.floor(diffMinutes / 60);
		return `${diffHours}h ${diffMinutes % 60}m ago`;
	}

	function getSocialProofText(session: LiveSession): string {
		const viewers = session.viewer_count || 0;
		if (viewers > 100) return 'Hot! 🔥';
		if (viewers > 50) return 'Popular 📈';
		if (viewers > 20) return 'Trending ⭐';
		return 'New';
	}

	function getSessionPriority(session: LiveSession): number {
		// Sort by viewer count primarily, then by start time
		return (session.viewer_count || 0) * 1000 + 
			   (new Date(session.started_at || session.created_at).getTime() / 1000000);
	}

	// Sort sessions by priority (most viewers first, then most recent)
	const sortedSessions = $derived(activeSessions.sort((a, b) => getSessionPriority(b) - getSessionPriority(a)));
</script>

<div class="live-shopping-list">
	<!-- Full Session View (Modal) -->
	{#if selectedSession}
		<div class="session-modal-overlay" role="dialog" tabindex="0" onclick={closeSession} onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeSession();
			}
		}} aria-label="Live shopping session modal">
			<div class="session-modal" role="document" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					closeSession();
				}
			}}>
				<div class="modal-header">
					<h2>Live Shopping Session</h2>
					<button class="close-btn" onclick={closeSession}>&times;</button>
				</div>
				<div class="modal-content">
					<LiveShopping 
						session={selectedSession} 
						showChat={true} 
						autoJoin={true}
						onPurchase={async (productId) => {
							// Handle purchase logic here
							console.log('Purchase product:', productId);
						}}
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Header -->
	<div class="list-header">
		<div class="header-content">
			<div class="header-icon">
				<Play size={24} />
			</div>
			<div>
				<h3 class="header-title">Live Shopping</h3>
				<p class="header-subtitle">Join live product demonstrations</p>
			</div>
		</div>
		<div class="session-count">
			{activeSessions.length} live now
		</div>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="loading-container">
			<div class="loading-spinner"></div>
			<p>Loading live sessions...</p>
		</div>
	{:else if activeSessions.length === 0}
		<!-- Empty State -->
		<div class="empty-state">
			<div class="empty-icon">📺</div>
			<h4>No Live Sessions Right Now</h4>
			<p>Check back soon for live product demonstrations!</p>
			<Button onclick={() => window.location.reload()} variant="outline">
				Refresh
			</Button>
		</div>
	{:else}
		<!-- Sessions Grid -->
		<div class="sessions-grid">
			{#each sortedSessions as session}
				<div class="session-card" role="button" tabindex="0" onclick={() => joinSession(session)} onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						joinSession(session);
					}
				}} aria-label="Join live session: {session.title}">
					<!-- Live Indicator -->
					<div class="live-badge">
						<span class="live-dot"></span>
						LIVE
					</div>

					<!-- Social Proof Badge -->
					<div class="social-proof-badge">
						{getSocialProofText(session)}
					</div>

					<!-- Product Image -->
					<div class="session-image">
						<img 
							src={session.product?.images?.[0] || '/placeholder.jpg'} 
							alt={session.product?.title || session.title}
							loading="lazy"
						/>
						
						<!-- Viewer Overlay -->
						<div class="viewer-overlay">
							<Users size={14} />
							{session.viewer_count || 0}
						</div>
					</div>

					<!-- Session Info -->
					<div class="session-info">
						<div class="session-title-section">
							<h4 class="session-title">{session.title}</h4>
							<div class="session-duration">
								<Clock size={12} />
								{formatDuration(session.started_at || session.created_at)}
							</div>
						</div>

						<!-- Seller Info -->
						{#if session.seller}
							<div class="seller-info">
								<img 
									src={session.seller.avatar_url || '/default-avatar.jpg'} 
									alt={session.seller.username}
									class="seller-avatar"
								/>
								<div class="seller-details">
									<span class="seller-name">
										{session.seller.username}
										{#if session.seller.verified}
											<span class="verified-badge">✓</span>
										{/if}
									</span>
								</div>
							</div>
						{/if}

						<!-- Product Info -->
						{#if session.product}
							<div class="product-info">
								<div class="product-title">{session.product.title}</div>
								<div class="product-price">{session.product.price}лв</div>
							</div>
						{/if}

						<!-- Engagement Stats -->
						<div class="engagement-stats">
							<div class="stat-item">
								<Eye size={14} />
								<span>{session.viewer_count || 0}</span>
							</div>
							<div class="stat-item">
								<ShoppingBag size={14} />
								<span>Hot item</span>
							</div>
						</div>

						<!-- Join Button -->
						<Button class="join-session-btn" onclick={() => joinSession(session)}>
							<Play size={16} />
							Watch Live
						</Button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Featured Section (Top sessions) -->
		{#if sortedSessions.length > 0}
			<div class="featured-section">
				<h4 class="featured-title">🔥 Hottest Sessions</h4>
				<div class="featured-sessions">
					{#each sortedSessions.slice(0, 3) as session}
						<div class="featured-session" role="button" tabindex="0" onclick={() => joinSession(session)} onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								joinSession(session);
							}
						}} aria-label="Join featured session: {session.title}">
							<div class="featured-image">
								<img src={session.product?.images?.[0] || '/placeholder.jpg'} alt={session.title} />
								<div class="featured-overlay">
									<div class="featured-viewers">
										<Users size={16} />
										{session.viewer_count || 0} watching
									</div>
									<Play class="play-icon" size={24} />
								</div>
							</div>
							<div class="featured-info">
								<div class="featured-session-title">{session.title}</div>
								<div class="featured-seller">by {session.seller?.username}</div>
								<div class="featured-price">{session.product?.price}лв</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Tips Section -->
		<div class="tips-section">
			<div class="tip-card">
				<Zap class="tip-icon" size={20} />
				<div>
					<div class="tip-title">Live Shopping Benefits</div>
					<div class="tip-text">Ask questions, see products in action, and get exclusive live deals!</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.live-shopping-list {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	/* Header */
	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1.5rem;
		background: linear-gradient(135deg, #e60023 0%, #ff4458 100%);
		color: white;
		border-radius: 16px;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.header-icon {
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
	}

	.header-title {
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
	}

	.header-subtitle {
		font-size: 0.875rem;
		opacity: 0.9;
		margin: 0.25rem 0 0 0;
	}

	.session-count {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
	}

	/* Loading State */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		color: #6b7280;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid #e5e7eb;
		border-top: 3px solid #e60023;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		text-align: center;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h4 {
		color: #1f2937;
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
	}

	.empty-state p {
		color: #6b7280;
		margin: 0 0 1.5rem 0;
	}

	/* Sessions Grid */
	.sessions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}

	.session-card {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.session-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	/* Badges */
	.live-badge {
		position: absolute;
		top: 12px;
		left: 12px;
		background: #e60023;
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		z-index: 2;
		box-shadow: 0 2px 8px rgba(230, 0, 35, 0.3);
	}

	.live-dot {
		width: 6px;
		height: 6px;
		background: #00ff00;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	.social-proof-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.25rem 0.625rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		z-index: 2;
	}

	/* Session Image */
	.session-image {
		position: relative;
		aspect-ratio: 16/9;
		overflow: hidden;
	}

	.session-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s;
	}

	.session-card:hover .session-image img {
		transform: scale(1.05);
	}

	.viewer-overlay {
		position: absolute;
		bottom: 12px;
		left: 12px;
		background: rgba(0, 0, 0, 0.8);
		color: white;
		padding: 0.375rem 0.75rem;
		border-radius: 16px;
		font-size: 0.75rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* Session Info */
	.session-info {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.session-title-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.session-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
		flex: 1;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.session-duration {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 500;
		flex-shrink: 0;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.seller-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.verified-badge {
		color: #059669;
		font-size: 0.75rem;
	}

	.product-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.product-title {
		font-weight: 500;
		color: #374151;
		font-size: 0.875rem;
		flex: 1;
		margin-right: 1rem;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.product-price {
		font-size: 1.125rem;
		font-weight: 800;
		color: #e60023;
	}

	.engagement-stats {
		display: flex;
		gap: 1rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.join-session-btn {
		background: #e60023;
		color: white;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.75rem;
		font-weight: 600;
		border-radius: 8px;
	}

	.join-session-btn:hover {
		background: #cc001e;
	}

	/* Featured Section */
	.featured-section {
		margin-bottom: 3rem;
	}

	.featured-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.featured-sessions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.featured-session {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		cursor: pointer;
		transition: transform 0.2s;
	}

	.featured-session:hover {
		transform: translateY(-2px);
	}

	.featured-image {
		position: relative;
		aspect-ratio: 4/3;
	}

	.featured-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.featured-viewers {
		position: absolute;
		bottom: 12px;
		left: 12px;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.play-icon {
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.featured-session:hover .play-icon {
		opacity: 1;
	}

	.featured-info {
		padding: 1rem;
	}

	.featured-session-title {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 0.25rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.featured-seller {
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 0.5rem;
	}

	.featured-price {
		font-weight: 700;
		color: #e60023;
		font-size: 1.125rem;
	}

	/* Tips Section */
	.tips-section {
		margin-bottom: 2rem;
	}

	.tip-card {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border: 1px solid #0284c7;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 600px;
		margin: 0 auto;
	}

	.tip-icon {
		color: #0284c7;
		flex-shrink: 0;
	}

	.tip-title {
		font-weight: 600;
		color: #0c4a6e;
		margin-bottom: 0.25rem;
	}

	.tip-text {
		color: #075985;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	/* Modal */
	.session-modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.session-modal {
		background: white;
		border-radius: 16px;
		width: 100%;
		max-width: 900px;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #6b7280;
		padding: 0.25rem;
		border-radius: 4px;
		transition: color 0.2s;
	}

	.close-btn:hover {
		color: #1f2937;
	}

	.modal-content {
		overflow-y: auto;
		max-height: calc(90vh - 80px);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.sessions-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.featured-sessions {
			grid-template-columns: 1fr;
		}

		.list-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.session-title-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.session-modal {
			margin: 0;
			border-radius: 0;
			height: 100vh;
			max-height: none;
		}

		.modal-content {
			max-height: calc(100vh - 80px);
		}
	}
</style>