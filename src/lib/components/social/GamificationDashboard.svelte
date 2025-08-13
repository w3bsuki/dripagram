<script lang="ts">
	import { onMount } from 'svelte';
	import { Star, Trophy, Gift, Users, Zap, Crown, Target, TrendingUp, Award } from '@lucide/svelte';
	import { gamificationService, type SellerReputation, type LoyaltyPoints, type Badge, type ReferralProgram } from '$lib/services/gamification';
	import Button from '$lib/components/native/Button.svelte';
	import { Progress } from '$lib/components/native';

	let { userId } = $props<{ userId: string }>();

	// State
	let reputation = $state<SellerReputation | null>(null);
	let loyaltyPoints = $state<LoyaltyPoints | null>(null);
	let badges = $state<Badge[]>([]);
	let referralProgram = $state<ReferralProgram | null>(null);
	let leaderboard = $state<any[]>([]);
	let isLoading = $state(true);
	let activeTab = $state<'overview' | 'badges' | 'loyalty' | 'referrals' | 'leaderboard'>('overview');

	onMount(async () => {
		await loadGamificationData();
	});

	async function loadGamificationData() {
		isLoading = true;
		try {
			const [repData, loyaltyData, badgesData, referralData, leaderboardData] = await Promise.all([
				gamificationService.calculateSellerReputation(userId),
				gamificationService.awardPoints({ // This also fetches current loyalty data
					type: 'product_liked',
					user_id: userId,
					points_earned: 0,
					multiplier_applied: 1
				}).catch(() => ({ user_id: userId, total_points: 0, available_points: 0, lifetime_points: 0, current_tier: 'newcomer', tier_progress: 0, points_to_next_tier: 100, multiplier: 1, last_activity: new Date().toISOString() })),
				gamificationService.getAvailableBadges(userId),
				gamificationService.getReferralProgram(userId),
				gamificationService.getLeaderboard('reputation', 10)
			]);

			reputation = repData;
			loyaltyPoints = loyaltyData as LoyaltyPoints;
			badges = badgesData;
			referralProgram = referralData;
			leaderboard = leaderboardData;
		} catch (error) {
			console.error('Failed to load gamification data:', error);
		} finally {
			isLoading = false;
		}
	}

	function getLevelColor(level: string): string {
		switch (level) {
			case 'diamond': return 'text-cyan-400';
			case 'platinum': return 'text-gray-400';
			case 'gold': return 'text-yellow-500';
			case 'silver': return 'text-gray-500';
			case 'bronze': return 'text-orange-600';
			default: return 'text-gray-600';
		}
	}

	function getLevelIcon(level: string): any {
		switch (level) {
			case 'diamond': return Crown;
			case 'platinum': return Star;
			case 'gold': return Trophy;
			case 'silver': return Award;
			default: return Target;
		}
	}

	function getTierColor(tier: string): string {
		switch (tier) {
			case 'champion': return 'text-purple-600';
			case 'elite': return 'text-blue-600';
			case 'vip': return 'text-green-600';
			case 'regular': return 'text-orange-600';
			default: return 'text-gray-600';
		}
	}

	function getRarityColor(rarity: string): string {
		switch (rarity) {
			case 'legendary': return 'border-purple-500 bg-purple-50 text-purple-700';
			case 'epic': return 'border-blue-500 bg-blue-50 text-blue-700';
			case 'rare': return 'border-green-500 bg-green-50 text-green-700';
			default: return 'border-gray-300 bg-gray-50 text-gray-700';
		}
	}

	function formatPoints(points: number): string {
		if (points >= 1000000) {
			return `${(points / 1000000).toFixed(1)}M`;
		}
		if (points >= 1000) {
			return `${(points / 1000).toFixed(1)}K`;
		}
		return points.toString();
	}

	async function copyReferralLink() {
		if (!referralProgram) return;
		
		const referralUrl = `${window.location.origin}/auth/signup?ref=${referralProgram.referral_code}`;
		
		try {
			await navigator.clipboard.writeText(referralUrl);
			// Show success message
		} catch (error) {
			console.error('Failed to copy referral link:', error);
		}
	}

	function getEarnedBadges(): Badge[] {
		return badges.filter(badge => badge.earned_at);
	}

	function getInProgressBadges(): Badge[] {
		return badges.filter(badge => !badge.earned_at && badge.progress && badge.progress > 0);
	}

	function getAvailableBadges(): Badge[] {
		return badges.filter(badge => !badge.earned_at && (!badge.progress || badge.progress === 0));
	}
</script>

<div class="gamification-dashboard">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading your achievements...</p>
		</div>
	{:else}
		<!-- Tab Navigation -->
		<div class="tab-nav">
			<button 
				class="tab-btn {activeTab === 'overview' ? 'active' : ''}"
				onclick={() => activeTab = 'overview'}
			>
				<TrendingUp size={16} />
				Overview
			</button>
			<button 
				class="tab-btn {activeTab === 'badges' ? 'active' : ''}"
				onclick={() => activeTab = 'badges'}
			>
				<Trophy size={16} />
				Badges ({getEarnedBadges().length})
			</button>
			<button 
				class="tab-btn {activeTab === 'loyalty' ? 'active' : ''}"
				onclick={() => activeTab = 'loyalty'}
			>
				<Star size={16} />
				Loyalty Points
			</button>
			<button 
				class="tab-btn {activeTab === 'referrals' ? 'active' : ''}"
				onclick={() => activeTab = 'referrals'}
			>
				<Users size={16} />
				Referrals
			</button>
			<button 
				class="tab-btn {activeTab === 'leaderboard' ? 'active' : ''}"
				onclick={() => activeTab === 'leaderboard'}
			>
				<Crown size={16} />
				Leaderboard
			</button>
		</div>

		<!-- Overview Tab -->
		{#if activeTab === 'overview'}
			<div class="overview-grid">
				<!-- Seller Reputation -->
				{#if reputation}
					<div class="stat-card reputation-card">
						<div class="card-header">
							{@const IconComponent = getLevelIcon(reputation.level)}
							<IconComponent class="header-icon {getLevelColor(reputation.level)}" size={24} />
							<div>
								<h3>Seller Reputation</h3>
								<p class="level-text {getLevelColor(reputation.level)}">{reputation.level.toUpperCase()}</p>
							</div>
						</div>
						<div class="reputation-score">{reputation.overall_score}/100</div>
						<Progress value={reputation.level_progress} class="level-progress" />
						<p class="progress-text">{reputation.level_progress}% to next level</p>
					</div>
				{/if}

				<!-- Loyalty Points -->
				{#if loyaltyPoints}
					<div class="stat-card loyalty-card">
						<div class="card-header">
							<Star class="header-icon text-yellow-500" size={24} />
							<div>
								<h3>Loyalty Points</h3>
								<p class="tier-text {getTierColor(loyaltyPoints.current_tier)}">{loyaltyPoints.current_tier.toUpperCase()}</p>
							</div>
						</div>
						<div class="points-amount">{formatPoints(loyaltyPoints.available_points)}</div>
						<Progress value={loyaltyPoints.tier_progress} class="tier-progress" />
						<p class="progress-text">{loyaltyPoints.points_to_next_tier} points to next tier</p>
					</div>
				{/if}

				<!-- Quick Stats -->
				<div class="stat-card stats-card">
					<h3>Quick Stats</h3>
					<div class="quick-stats">
						<div class="stat-item">
							<Trophy size={16} />
							<div>
								<div class="stat-value">{getEarnedBadges().length}</div>
								<div class="stat-label">Badges Earned</div>
							</div>
						</div>
						<div class="stat-item">
							<Users size={16} />
							<div>
								<div class="stat-value">{referralProgram?.total_referrals || 0}</div>
								<div class="stat-label">Referrals</div>
							</div>
						</div>
						<div class="stat-item">
							<Target size={16} />
							<div>
								<div class="stat-value">{reputation?.total_sales || 0}</div>
								<div class="stat-label">Total Sales</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Achievements -->
				<div class="stat-card achievements-card">
					<h3>Recent Achievements</h3>
					<div class="recent-badges">
						{#each getEarnedBadges().slice(0, 3) as badge}
							<div class="recent-badge">
								<span class="badge-icon">{badge.icon}</span>
								<div>
									<div class="badge-name">{badge.name}</div>
									<div class="earned-date">Earned recently</div>
								</div>
							</div>
						{/each}
						{#if getEarnedBadges().length === 0}
							<p class="no-achievements">Start selling to earn your first badges! 🎯</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Badges Tab -->
		{#if activeTab === 'badges'}
			<div class="badges-section">
				<!-- Earned Badges -->
				<div class="badge-category">
					<h3 class="category-title">Earned Badges ({getEarnedBadges().length})</h3>
					<div class="badges-grid">
						{#each getEarnedBadges() as badge}
							<div class="badge-card earned {getRarityColor(badge.rarity)}">
								<div class="badge-icon-large">{badge.icon}</div>
								<div class="badge-info">
									<h4 class="badge-name">{badge.name}</h4>
									<p class="badge-description">{badge.description}</p>
									<div class="badge-meta">
										<span class="rarity {badge.rarity}">{badge.rarity}</span>
										<span class="earned-date">Earned {new Date(badge.earned_at!).toLocaleDateString()}</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- In Progress Badges -->
				{#if getInProgressBadges().length > 0}
					<div class="badge-category">
						<h3 class="category-title">In Progress ({getInProgressBadges().length})</h3>
						<div class="badges-grid">
							{#each getInProgressBadges() as badge}
								<div class="badge-card in-progress">
									<div class="badge-icon-large">{badge.icon}</div>
									<div class="badge-info">
										<h4 class="badge-name">{badge.name}</h4>
										<p class="badge-description">{badge.description}</p>
										<Progress value={badge.progress || 0} class="badge-progress" />
										<div class="progress-info">
											{Math.round(badge.progress || 0)}% complete
										</div>
										<div class="requirements">
											{#each badge.requirements as req}
												<div class="requirement">
													{req.current_value || 0} / {req.value} {req.description}
												</div>
											{/each}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Available Badges -->
				<div class="badge-category">
					<h3 class="category-title">Available to Earn ({getAvailableBadges().length})</h3>
					<div class="badges-grid">
						{#each getAvailableBadges() as badge}
							<div class="badge-card available">
								<div class="badge-icon-large grayscale">{badge.icon}</div>
								<div class="badge-info">
									<h4 class="badge-name">{badge.name}</h4>
									<p class="badge-description">{badge.description}</p>
									<div class="requirements">
										{#each badge.requirements as req}
											<div class="requirement">
												{req.description}
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Loyalty Tab -->
		{#if activeTab === 'loyalty' && loyaltyPoints}
			<div class="loyalty-section">
				<div class="loyalty-overview">
					<div class="points-summary">
						<div class="main-points">
							<span class="points-value">{formatPoints(loyaltyPoints.available_points)}</span>
							<span class="points-label">Available Points</span>
						</div>
						<div class="tier-info">
							<span class="current-tier {getTierColor(loyaltyPoints.current_tier)}">
								{loyaltyPoints.current_tier.toUpperCase()} TIER
							</span>
							<div class="multiplier">
								{loyaltyPoints.multiplier}x points multiplier
							</div>
						</div>
					</div>

					<div class="tier-progress-section">
						<h4>Tier Progress</h4>
						<Progress value={loyaltyPoints.tier_progress} class="tier-progress-bar" />
						<p>{loyaltyPoints.points_to_next_tier} points to next tier</p>
					</div>
				</div>

				<div class="loyalty-stats">
					<div class="stat-box">
						<div class="stat-number">{formatPoints(loyaltyPoints.lifetime_points)}</div>
						<div class="stat-description">Lifetime Points</div>
					</div>
					<div class="stat-box">
						<div class="stat-number">{formatPoints(loyaltyPoints.total_points)}</div>
						<div class="stat-description">Total Earned</div>
					</div>
					<div class="stat-box">
						<div class="stat-number">{loyaltyPoints.multiplier}x</div>
						<div class="stat-description">Current Multiplier</div>
					</div>
				</div>

				<!-- Point Earning Guide -->
				<div class="earning-guide">
					<h4>How to Earn Points</h4>
					<div class="earning-methods">
						<div class="method">
							<Zap size={16} />
							<div>
								<div class="method-name">Complete a Sale</div>
								<div class="method-points">100 points</div>
							</div>
						</div>
						<div class="method">
							<Star size={16} />
							<div>
								<div class="method-name">Receive 5-Star Review</div>
								<div class="method-points">50 points</div>
							</div>
						</div>
						<div class="method">
							<Users size={16} />
							<div>
								<div class="method-name">Successful Referral</div>
								<div class="method-points">500 points</div>
							</div>
						</div>
						<div class="method">
							<Trophy size={16} />
							<div>
								<div class="method-name">Earn a Badge</div>
								<div class="method-points">100-5000 points</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Referrals Tab -->
		{#if activeTab === 'referrals' && referralProgram}
			<div class="referrals-section">
				<div class="referral-overview">
					<div class="referral-stats">
						<div class="stat-card">
							<div class="stat-number">{referralProgram.total_referrals}</div>
							<div class="stat-label">Total Referrals</div>
						</div>
						<div class="stat-card">
							<div class="stat-number">{referralProgram.successful_referrals}</div>
							<div class="stat-label">Successful</div>
						</div>
						<div class="stat-card">
							<div class="stat-number">{formatPoints(referralProgram.total_rewards_earned)}</div>
							<div class="stat-label">Rewards Earned</div>
						</div>
					</div>

					<div class="referral-link-section">
						<h4>Your Referral Link</h4>
						<div class="referral-link-container">
							<input 
								type="text" 
								readonly 
								value="{window.location.origin}/auth/signup?ref={referralProgram.referral_code}"
								class="referral-link-input"
							/>
							<Button onclick={copyReferralLink} variant="outline">
								Copy Link
							</Button>
						</div>
						<p class="referral-code">Your code: <strong>{referralProgram.referral_code}</strong></p>
					</div>
				</div>

				<div class="referral-rewards">
					<h4>Referral Rewards</h4>
					<div class="reward-tiers">
						<div class="tier">
							<div class="tier-name">Friend Signs Up</div>
							<div class="tier-reward">100 points</div>
						</div>
						<div class="tier">
							<div class="tier-name">Friend Makes First Purchase</div>
							<div class="tier-reward">500 points</div>
						</div>
						<div class="tier">
							<div class="tier-name">Friend Becomes Regular User</div>
							<div class="tier-reward">1000 points</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Leaderboard Tab -->
		{#if activeTab === 'leaderboard'}
			<div class="leaderboard-section">
				<h3>Top Sellers Leaderboard</h3>
				<div class="leaderboard-list">
					{#each leaderboard as seller, index}
						<div class="leaderboard-item {index < 3 ? 'top-three' : ''}">
							<div class="rank">
								{#if index === 0}
									<Crown class="rank-icon gold" size={20} />
								{:else if index === 1}
									<Trophy class="rank-icon silver" size={20} />
								{:else if index === 2}
									<Award class="rank-icon bronze" size={20} />
								{:else}
									<span class="rank-number">#{index + 1}</span>
								{/if}
							</div>
							<div class="seller-info">
								<img 
									src={seller.profiles?.avatar_url || '/default-avatar.jpg'} 
									alt={seller.profiles?.username}
									class="seller-avatar"
								/>
								<div>
									<div class="seller-name">{seller.profiles?.username || 'Anonymous'}</div>
									<div class="seller-level {getLevelColor(seller.level)}">{seller.level}</div>
								</div>
							</div>
							<div class="seller-stats">
								<div class="reputation-score">{seller.overall_score}/100</div>
								<div class="total-sales">{seller.total_sales} sales</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.gamification-dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	.loading-state {
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
		border-top: 3px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Tab Navigation */
	.tab-nav {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		border-bottom: 1px solid #e5e7eb;
		overflow-x: auto;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		border: none;
		background: none;
		color: #6b7280;
		cursor: pointer;
		font-weight: 500;
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.tab-btn:hover {
		color: #3b82f6;
	}

	.tab-btn.active {
		color: #3b82f6;
		border-bottom-color: #3b82f6;
	}

	/* Overview Grid */
	.overview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.header-icon {
		flex-shrink: 0;
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
	}

	.level-text, .tier-text {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0;
	}

	.reputation-score, .points-amount {
		font-size: 2rem;
		font-weight: 800;
		margin: 1rem 0;
		color: #1f2937;
	}

	.progress-text {
		font-size: 0.875rem;
		color: #6b7280;
		margin-top: 0.5rem;
	}

	.quick-stats {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.recent-badges {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.recent-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.badge-icon {
		font-size: 1.5rem;
	}

	.badge-name {
		font-weight: 600;
		color: #1f2937;
	}

	.earned-date {
		font-size: 0.75rem;
		color: #6b7280;
	}

	.no-achievements {
		text-align: center;
		color: #6b7280;
		font-style: italic;
		padding: 1rem;
	}

	/* Badges Section */
	.badges-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.badge-category {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.category-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 1.5rem 0;
	}

	.badges-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.badge-card {
		border: 2px solid;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		gap: 1rem;
		transition: all 0.2s;
	}

	.badge-card.earned {
		background: rgba(34, 197, 94, 0.05);
	}

	.badge-card.in-progress {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.05);
	}

	.badge-card.available {
		border-color: #d1d5db;
		background: #f9fafb;
		opacity: 0.7;
	}

	.badge-icon-large {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.badge-icon-large.grayscale {
		filter: grayscale(100%);
	}

	.badge-info {
		flex: 1;
	}

	.badge-info .badge-name {
		font-size: 1.125rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.badge-description {
		color: #6b7280;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
	}

	.badge-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		margin-top: 0.75rem;
	}

	.rarity {
		text-transform: capitalize;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 12px;
		background: currentColor;
		color: white !important;
	}

	.requirements {
		margin-top: 0.5rem;
	}

	.requirement {
		font-size: 0.75rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
	}

	.progress-info {
		font-size: 0.875rem;
		color: #f59e0b;
		font-weight: 600;
		margin-top: 0.5rem;
	}

	/* Loyalty Section */
	.loyalty-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.loyalty-overview {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		color: white;
		border-radius: 16px;
		padding: 2rem;
	}

	.points-summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.main-points {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.points-value {
		font-size: 3rem;
		font-weight: 800;
		line-height: 1;
	}

	.points-label {
		font-size: 1.125rem;
		opacity: 0.9;
	}

	.tier-info {
		text-align: right;
	}

	.current-tier {
		font-size: 1.25rem;
		font-weight: 700;
		display: block;
		margin-bottom: 0.5rem;
	}

	.multiplier {
		font-size: 0.875rem;
		opacity: 0.9;
	}

	.tier-progress-section h4 {
		color: white;
		margin-bottom: 1rem;
	}

	.tier-progress-section p {
		color: rgba(255, 255, 255, 0.9);
		margin-top: 0.5rem;
	}

	.loyalty-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.stat-box {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		text-align: center;
		border: 1px solid #e5e7eb;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 800;
		color: #1f2937;
		margin-bottom: 0.5rem;
	}

	.stat-description {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.earning-guide {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.earning-guide h4 {
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.earning-methods {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.method {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.method-name {
		font-weight: 500;
		color: #1f2937;
	}

	.method-points {
		font-size: 0.875rem;
		color: #059669;
		font-weight: 600;
	}

	/* Referrals Section */
	.referrals-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.referral-overview {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #e5e7eb;
	}

	.referral-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.referral-link-section h4 {
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.referral-link-container {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.referral-link-input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: #f9fafb;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.referral-code {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.referral-rewards {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		border: 1px solid #e5e7eb;
	}

	.referral-rewards h4 {
		margin-bottom: 1rem;
		color: #1f2937;
	}

	.reward-tiers {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tier {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.tier-name {
		font-weight: 500;
		color: #1f2937;
	}

	.tier-reward {
		font-weight: 600;
		color: #059669;
	}

	/* Leaderboard Section */
	.leaderboard-section {
		background: white;
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #e5e7eb;
	}

	.leaderboard-section h3 {
		margin-bottom: 1.5rem;
		color: #1f2937;
		text-align: center;
	}

	.leaderboard-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.leaderboard-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		border-radius: 8px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
	}

	.leaderboard-item.top-three {
		background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
		border-color: #f59e0b;
	}

	.rank {
		width: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.rank-icon.gold {
		color: #fbbf24;
	}

	.rank-icon.silver {
		color: #9ca3af;
	}

	.rank-icon.bronze {
		color: #d97706;
	}

	.rank-number {
		font-weight: 600;
		color: #6b7280;
	}

	.seller-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.seller-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		object-fit: cover;
	}

	.seller-name {
		font-weight: 600;
		color: #1f2937;
	}

	.seller-level {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.seller-stats {
		text-align: right;
	}

	.reputation-score {
		font-weight: 700;
		color: #1f2937;
		font-size: 1.125rem;
	}

	.total-sales {
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.overview-grid {
			grid-template-columns: 1fr;
		}

		.badges-grid {
			grid-template-columns: 1fr;
		}

		.loyalty-stats {
			grid-template-columns: repeat(3, 1fr);
		}

		.earning-methods {
			grid-template-columns: 1fr;
		}

		.referral-stats {
			grid-template-columns: repeat(3, 1fr);
		}

		.points-summary {
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 1rem;
		}

		.tier-info {
			text-align: center;
		}

		.referral-link-container {
			flex-direction: column;
		}
	}
</style>