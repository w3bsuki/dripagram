/**
 * Gamification Service - Badges, reputation, loyalty, and referral system
 * Drives user engagement through achievement systems and rewards
 * Part of Phase 5C: Market Leadership Features
 */

import { createClient } from '$lib/supabase/client';
const supabase = createClient();

export interface SellerReputation {
	user_id: string;
	overall_score: number;
	response_time_score: number;
	shipping_score: number;
	quality_score: number;
	communication_score: number;
	total_sales: number;
	total_reviews: number;
	positive_feedback_rate: number;
	level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
	level_progress: number; // 0-100% to next level
	badges: Badge[];
	last_updated: string;
}

export interface Badge {
	id: string;
	name: string;
	description: string;
	icon: string;
	category: 'sales' | 'quality' | 'engagement' | 'social' | 'special';
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
	requirements: BadgeRequirement[];
	earned_at?: string;
	progress?: number; // For in-progress badges
}

export interface BadgeRequirement {
	type: 'sales_count' | 'review_rating' | 'response_time' | 'social_shares' | 'referrals' | 'streak';
	value: number;
	current_value?: number;
	description: string;
}

export interface LoyaltyPoints {
	user_id: string;
	total_points: number;
	available_points: number;
	lifetime_points: number;
	current_tier: 'newcomer' | 'regular' | 'vip' | 'elite' | 'champion';
	tier_progress: number;
	points_to_next_tier: number;
	multiplier: number; // Current point earning multiplier
	last_activity: string;
}

export interface ReferralProgram {
	user_id: string;
	referral_code: string;
	total_referrals: number;
	successful_referrals: number;
	total_rewards_earned: number;
	referral_tier: 'starter' | 'ambassador' | 'influencer' | 'legend';
	referral_history: ReferralReward[];
}

export interface ReferralReward {
	id: string;
	referrer_id: string;
	referred_id: string;
	reward_type: 'points' | 'cashback' | 'discount';
	reward_value: number;
	status: 'pending' | 'paid' | 'expired';
	earned_at: string;
	paid_at?: string;
}

export interface Achievement {
	id: string;
	user_id: string;
	badge_id: string;
	unlocked_at: string;
	milestone_reached: string;
	reward_points?: number;
}

export interface GameEvent {
	type: 'sale_completed' | 'review_received' | 'product_liked' | 'referral_signup' | 'streak_achieved';
	user_id: string;
	points_earned: number;
	multiplier_applied: number;
	badge_progress?: { badge_id: string; progress: number; unlocked: boolean }[];
	metadata?: Record<string, any>;
}

export class GamificationService {
	/**
	 * Calculate seller reputation score based on multiple factors
	 */
	async calculateSellerReputation(userId: string): Promise<SellerReputation> {
		// Fetch seller statistics
		const [salesData, reviewsData, responseData] = await Promise.all([
			this.getSalesMetrics(userId),
			this.getReviewMetrics(userId),
			this.getResponseMetrics(userId)
		]);

		// Calculate component scores (0-100)
		const qualityScore = this.calculateQualityScore(reviewsData);
		const shippingScore = this.calculateShippingScore(salesData);
		const communicationScore = this.calculateCommunicationScore(responseData);
		const responseTimeScore = this.calculateResponseTimeScore(responseData);

		// Calculate overall score with weights
		const overallScore = Math.round(
			(qualityScore * 0.3) +
			(shippingScore * 0.25) +
			(communicationScore * 0.25) +
			(responseTimeScore * 0.2)
		);

		// Determine level based on score and sales volume
		const level = this.determineSellerLevel(overallScore, salesData.total_sales);
		const levelProgress = this.calculateLevelProgress(overallScore, level);

		// Get earned badges
		const badges = await this.getUserBadges(userId);

		const reputation: SellerReputation = {
			user_id: userId,
			overall_score: overallScore,
			response_time_score: responseTimeScore,
			shipping_score: shippingScore,
			quality_score: qualityScore,
			communication_score: communicationScore,
			total_sales: salesData.total_sales,
			total_reviews: reviewsData.total_reviews,
			positive_feedback_rate: reviewsData.positive_rate,
			level,
			level_progress: levelProgress,
			badges,
			last_updated: new Date().toISOString()
		};

		// Update database
		await supabase
			.from('seller_reputation')
			.upsert(reputation);

		return reputation;
	}

	/**
	 * Award points for various user actions
	 */
	async awardPoints(event: GameEvent): Promise<LoyaltyPoints> {
		const user = (await supabase.auth.getUser()).data.user;
		if (!user) throw new Error('User not authenticated');

		// Get current loyalty status
		let loyaltyData = await this.getLoyaltyPoints(user.id);

		// Calculate points with multiplier
		const basePoints = event.points_earned;
		const multiplier = loyaltyData.multiplier || 1;
		const finalPoints = Math.round(basePoints * multiplier);

		// Update points
		loyaltyData.total_points += finalPoints;
		loyaltyData.available_points += finalPoints;
		loyaltyData.lifetime_points += finalPoints;
		loyaltyData.last_activity = new Date().toISOString();

		// Check for tier progression
		const newTier = this.calculateTier(loyaltyData.lifetime_points);
		if (newTier !== loyaltyData.current_tier) {
			loyaltyData.current_tier = newTier;
			loyaltyData.multiplier = this.getTierMultiplier(newTier);
			
			// Award tier upgrade bonus
			const tierBonus = this.getTierUpgradeBonus(newTier);
			loyaltyData.available_points += tierBonus;

			// Track tier upgrade event
			await this.trackAchievementEvent({
				type: 'tier_upgrade',
				user_id: user.id,
				details: { new_tier: newTier, bonus_points: tierBonus }
			});
		}

		// Update tier progress
		const tierInfo = this.getTierInfo(loyaltyData.current_tier);
		loyaltyData.tier_progress = this.calculateTierProgress(loyaltyData.lifetime_points, tierInfo);
		loyaltyData.points_to_next_tier = tierInfo.next_threshold ? tierInfo.next_threshold - loyaltyData.lifetime_points : 0;

		// Save to database
		await supabase
			.from('loyalty_points')
			.upsert(loyaltyData);

		// Record points transaction
		await supabase
			.from('points_transactions')
			.insert({
				user_id: user.id,
				event_type: event.type,
				points_earned: finalPoints,
				multiplier_applied: multiplier,
				metadata: event.metadata
			});

		// Check for badge progress
		await this.updateBadgeProgress(user.id, event);

		return loyaltyData;
	}

	/**
	 * Create or get user's referral program data
	 */
	async getReferralProgram(userId: string): Promise<ReferralProgram> {
		const { data: existing } = await supabase
			.from('referral_programs')
			.select(`
				*,
				referral_history:referral_rewards(*)
			`)
			.eq('user_id', userId)
			.single();

		if (existing) {
			return existing;
		}

		// Create new referral program
		const referralCode = this.generateReferralCode(userId);
		const newProgram: ReferralProgram = {
			user_id: userId,
			referral_code: referralCode,
			total_referrals: 0,
			successful_referrals: 0,
			total_rewards_earned: 0,
			referral_tier: 'starter',
			referral_history: []
		};

		const { data } = await supabase
			.from('referral_programs')
			.insert(newProgram)
			.select()
			.single();

		return data || newProgram;
	}

	/**
	 * Process a referral signup
	 */
	async processReferralSignup(referralCode: string, newUserId: string): Promise<ReferralReward | null> {
		// Find referrer
		const { data: referrer } = await supabase
			.from('referral_programs')
			.select('user_id')
			.eq('referral_code', referralCode)
			.single();

		if (!referrer) return null;

		// Create referral reward
		const reward: Omit<ReferralReward, 'id'> = {
			referrer_id: referrer.user_id,
			referred_id: newUserId,
			reward_type: 'points',
			reward_value: 500, // Base referral reward
			status: 'pending', // Will be paid when referred user makes first purchase
			earned_at: new Date().toISOString()
		};

		const { data: rewardData } = await supabase
			.from('referral_rewards')
			.insert(reward)
			.select()
			.single();

		// Update referrer stats
		await supabase.rpc('increment_referral_count', { user_id: referrer.user_id });

		// Award immediate signup bonus to referrer
		await this.awardPoints({
			type: 'referral_signup',
			user_id: referrer.user_id,
			points_earned: 100,
			multiplier_applied: 1,
			metadata: { referred_user: newUserId }
		});

		return rewardData;
	}

	/**
	 * Get all available badges with progress
	 */
	async getAvailableBadges(userId: string): Promise<Badge[]> {
		// Define all available badges
		const allBadges: Omit<Badge, 'earned_at' | 'progress'>[] = [
			{
				id: 'first_sale',
				name: 'First Sale',
				description: 'Complete your first sale',
				icon: '🎉',
				category: 'sales',
				rarity: 'common',
				requirements: [{ type: 'sales_count', value: 1, description: 'Complete 1 sale' }]
			},
			{
				id: 'rising_star',
				name: 'Rising Star',
				description: 'Complete 10 sales',
				icon: '⭐',
				category: 'sales',
				rarity: 'common',
				requirements: [{ type: 'sales_count', value: 10, description: 'Complete 10 sales' }]
			},
			{
				id: 'top_seller',
				name: 'Top Seller',
				description: 'Complete 100 sales',
				icon: '🏆',
				category: 'sales',
				rarity: 'rare',
				requirements: [{ type: 'sales_count', value: 100, description: 'Complete 100 sales' }]
			},
			{
				id: 'perfectionist',
				name: 'Perfectionist',
				description: 'Maintain 4.8+ rating with 20+ reviews',
				icon: '💎',
				category: 'quality',
				rarity: 'epic',
				requirements: [
					{ type: 'review_rating', value: 48, description: 'Maintain 4.8+ average rating' },
					{ type: 'sales_count', value: 20, description: 'Have at least 20 reviews' }
				]
			},
			{
				id: 'speed_demon',
				name: 'Speed Demon',
				description: 'Respond to messages within 1 hour consistently',
				icon: '⚡',
				category: 'engagement',
				rarity: 'rare',
				requirements: [{ type: 'response_time', value: 60, description: 'Average response time under 1 hour' }]
			},
			{
				id: 'social_butterfly',
				name: 'Social Butterfly',
				description: 'Share 50+ products on social media',
				icon: '🦋',
				category: 'social',
				rarity: 'rare',
				requirements: [{ type: 'social_shares', value: 50, description: 'Share 50 products' }]
			},
			{
				id: 'influencer',
				name: 'Influencer',
				description: 'Refer 10 successful users',
				icon: '📢',
				category: 'social',
				rarity: 'epic',
				requirements: [{ type: 'referrals', value: 10, description: 'Refer 10 users who complete a purchase' }]
			},
			{
				id: 'streak_master',
				name: 'Streak Master',
				description: 'Sell at least one item for 30 consecutive days',
				icon: '🔥',
				category: 'engagement',
				rarity: 'legendary',
				requirements: [{ type: 'streak', value: 30, description: '30-day selling streak' }]
			}
		];

		// Get user's current progress and earned badges
		const userProgress = await this.getUserProgress(userId);
		const earnedBadges = await this.getUserBadges(userId);
		const earnedBadgeIds = earnedBadges.map(b => b.id);

		// Calculate progress for each badge
		const badgesWithProgress: Badge[] = allBadges.map(badge => {
			const isEarned = earnedBadgeIds.includes(badge.id);
			const earned_at = isEarned ? earnedBadges.find(b => b.id === badge.id)?.earned_at : undefined;
			
			// Calculate progress for non-earned badges
			let progress = 0;
			if (!isEarned) {
				const requirementProgress = badge.requirements.map(req => {
					const currentValue = this.getCurrentValue(userProgress, req.type);
					const reqProgress = Math.min(100, (currentValue / req.value) * 100);
					return { ...req, current_value: currentValue };
				});

				// Use minimum progress across all requirements
				progress = Math.min(...requirementProgress.map(r => (r.current_value || 0) / r.value * 100));
				
				// Update requirements with current values
				badge.requirements = requirementProgress;
			}

			return {
				...badge,
				earned_at,
				progress: isEarned ? 100 : progress
			};
		});

		return badgesWithProgress;
	}

	/**
	 * Spend loyalty points on rewards
	 */
	async spendPoints(userId: string, amount: number, rewardType: string, rewardDetails: any): Promise<boolean> {
		const loyaltyData = await this.getLoyaltyPoints(userId);

		if (loyaltyData.available_points < amount) {
			throw new Error('Insufficient points');
		}

		// Deduct points
		await supabase
			.from('loyalty_points')
			.update({
				available_points: loyaltyData.available_points - amount
			})
			.eq('user_id', userId);

		// Record transaction
		await supabase
			.from('points_transactions')
			.insert({
				user_id: userId,
				event_type: 'points_spent',
				points_earned: -amount,
				multiplier_applied: 1,
				metadata: { reward_type: rewardType, reward_details: rewardDetails }
			});

		return true;
	}

	/**
	 * Get leaderboard for different categories
	 */
	async getLeaderboard(category: 'reputation' | 'points' | 'sales', limit = 20): Promise<any[]> {
		let query;

		switch (category) {
			case 'reputation':
				query = supabase
					.from('seller_reputation')
					.select(`
						user_id,
						overall_score,
						level,
						total_sales,
						profiles!user_id (username, avatar_url)
					`)
					.order('overall_score', { ascending: false });
				break;
			case 'points':
				query = supabase
					.from('loyalty_points')
					.select(`
						user_id,
						lifetime_points,
						current_tier,
						profiles!user_id (username, avatar_url)
					`)
					.order('lifetime_points', { ascending: false });
				break;
			case 'sales':
				query = supabase
					.from('seller_reputation')
					.select(`
						user_id,
						total_sales,
						level,
						profiles!user_id (username, avatar_url)
					`)
					.order('total_sales', { ascending: false });
				break;
		}

		const { data } = await query.limit(limit);
		return data || [];
	}

	// Private helper methods
	private async getSalesMetrics(userId: string) {
		const { data } = await supabase.rpc('get_seller_sales_metrics', { seller_id: userId });
		return data || { total_sales: 0, completed_orders: 0, average_order_value: 0 };
	}

	private async getReviewMetrics(userId: string) {
		const { data } = await supabase.rpc('get_seller_review_metrics', { seller_id: userId });
		return data || { total_reviews: 0, average_rating: 0, positive_rate: 0 };
	}

	private async getResponseMetrics(userId: string) {
		const { data } = await supabase.rpc('get_seller_response_metrics', { seller_id: userId });
		return data || { average_response_time: 24, response_rate: 0 };
	}

	private calculateQualityScore(reviewData: any): number {
		if (reviewData.total_reviews === 0) return 70; // Default score for new sellers
		
		const ratingScore = (reviewData.average_rating / 5) * 100;
		const volumeBonus = Math.min(10, reviewData.total_reviews / 10); // Up to 10 point bonus
		
		return Math.min(100, Math.round(ratingScore + volumeBonus));
	}

	private calculateShippingScore(salesData: any): number {
		// Based on shipping speed, packaging quality, etc.
		// This would be calculated from shipping feedback
		return Math.min(100, Math.max(50, 85 - (salesData.avg_shipping_days || 0) * 5));
	}

	private calculateCommunicationScore(responseData: any): number {
		const responseRate = responseData.response_rate || 0;
		return Math.min(100, responseRate);
	}

	private calculateResponseTimeScore(responseData: any): number {
		const avgHours = responseData.average_response_time || 24;
		if (avgHours <= 1) return 100;
		if (avgHours <= 3) return 90;
		if (avgHours <= 6) return 80;
		if (avgHours <= 12) return 70;
		if (avgHours <= 24) return 60;
		return Math.max(20, 60 - (avgHours - 24) * 2);
	}

	private determineSellerLevel(score: number, totalSales: number): SellerReputation['level'] {
		if (score >= 95 && totalSales >= 500) return 'diamond';
		if (score >= 90 && totalSales >= 200) return 'platinum';
		if (score >= 80 && totalSales >= 50) return 'gold';
		if (score >= 70 && totalSales >= 10) return 'silver';
		return 'bronze';
	}

	private calculateLevelProgress(score: number, level: string): number {
		// Calculate progress to next level
		const levelThresholds = { bronze: 70, silver: 80, gold: 90, platinum: 95, diamond: 100 };
		const levels = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
		const currentIndex = levels.indexOf(level);
		
		if (currentIndex === levels.length - 1) return 100; // Max level
		
		const currentThreshold = levelThresholds[level as keyof typeof levelThresholds];
		const nextLevel = levels[currentIndex + 1];
		const nextThreshold = levelThresholds[nextLevel as keyof typeof levelThresholds];
		
		return Math.round(((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
	}

	private async getUserBadges(userId: string): Promise<Badge[]> {
		const { data } = await supabase
			.from('user_badges')
			.select(`
				badge_id,
				earned_at,
				badges (*)
			`)
			.eq('user_id', userId);

		return (data?.map(item => ({
			...(item.badges as Badge),
			earned_at: item.earned_at
		})) || []) as (Badge & { earned_at: any })[];
	}

	private async getLoyaltyPoints(userId: string): Promise<LoyaltyPoints> {
		const { data: existing } = await supabase
			.from('loyalty_points')
			.select('*')
			.eq('user_id', userId)
			.single();

		if (existing) return existing;

		// Create new loyalty record
		const newLoyalty: LoyaltyPoints = {
			user_id: userId,
			total_points: 0,
			available_points: 0,
			lifetime_points: 0,
			current_tier: 'newcomer',
			tier_progress: 0,
			points_to_next_tier: 100,
			multiplier: 1,
			last_activity: new Date().toISOString()
		};

		await supabase.from('loyalty_points').insert(newLoyalty);
		return newLoyalty;
	}

	private calculateTier(lifetimePoints: number): LoyaltyPoints['current_tier'] {
		if (lifetimePoints >= 50000) return 'champion';
		if (lifetimePoints >= 20000) return 'elite';
		if (lifetimePoints >= 5000) return 'vip';
		if (lifetimePoints >= 1000) return 'regular';
		return 'newcomer';
	}

	private getTierMultiplier(tier: string): number {
		const multipliers = { newcomer: 1, regular: 1.2, vip: 1.5, elite: 1.8, champion: 2.0 };
		return multipliers[tier as keyof typeof multipliers] || 1;
	}

	private getTierUpgradeBonus(tier: string): number {
		const bonuses = { regular: 200, vip: 500, elite: 1000, champion: 2000 };
		return bonuses[tier as keyof typeof bonuses] || 0;
	}

	private getTierInfo(tier: string) {
		const tiers = {
			newcomer: { threshold: 0, next_threshold: 1000 },
			regular: { threshold: 1000, next_threshold: 5000 },
			vip: { threshold: 5000, next_threshold: 20000 },
			elite: { threshold: 20000, next_threshold: 50000 },
			champion: { threshold: 50000, next_threshold: null }
		};
		return tiers[tier as keyof typeof tiers];
	}

	private calculateTierProgress(lifetimePoints: number, tierInfo: any): number {
		if (!tierInfo.next_threshold) return 100;
		return Math.round(((lifetimePoints - tierInfo.threshold) / (tierInfo.next_threshold - tierInfo.threshold)) * 100);
	}

	private generateReferralCode(userId: string): string {
		return `DRIP${userId.substring(0, 6).toUpperCase()}${Math.floor(Math.random() * 1000)}`;
	}

	private async getUserProgress(userId: string) {
		// This would fetch comprehensive user statistics
		const [salesData, reviewsData, socialData] = await Promise.all([
			this.getSalesMetrics(userId),
			this.getReviewMetrics(userId),
			supabase.from('social_shares').select('id').eq('user_id', userId)
		]);

		return {
			sales_count: salesData.total_sales,
			review_rating: reviewsData.average_rating * 10, // Convert to 0-50 scale
			social_shares: socialData?.data?.length || 0,
			// Add more metrics as needed
		};
	}

	private getCurrentValue(progress: any, type: string): number {
		const mapping = {
			sales_count: progress.sales_count || 0,
			review_rating: progress.review_rating || 0,
			social_shares: progress.social_shares || 0,
			response_time: progress.response_time || 24,
			referrals: progress.referrals || 0,
			streak: progress.streak || 0
		};
		return mapping[type as keyof typeof mapping] || 0;
	}

	private async updateBadgeProgress(userId: string, event: GameEvent): Promise<void> {
		// Check if any badges should be unlocked based on this event
		const availableBadges = await this.getAvailableBadges(userId);
		
		for (const badge of availableBadges) {
			if (badge.earned_at || !badge.progress || badge.progress < 100) continue;

			// Badge should be unlocked
			await this.unlockBadge(userId, badge.id);
		}
	}

	private async unlockBadge(userId: string, badgeId: string): Promise<void> {
		// Award the badge
		await supabase
			.from('user_badges')
			.insert({
				user_id: userId,
				badge_id: badgeId,
				earned_at: new Date().toISOString()
			});

		// Award bonus points
		const badgePoints = this.getBadgePoints(badgeId);
		if (badgePoints > 0) {
			await this.awardPoints({
				type: 'sale_completed', // Generic type for badge rewards
				user_id: userId,
				points_earned: badgePoints,
				multiplier_applied: 1,
				metadata: { badge_unlocked: badgeId }
			});
		}

		// Track achievement
		await this.trackAchievementEvent({
			type: 'badge_unlocked',
			user_id: userId,
			details: { badge_id: badgeId, points_awarded: badgePoints }
		});
	}

	private getBadgePoints(badgeId: string): number {
		const points = {
			first_sale: 100,
			rising_star: 250,
			top_seller: 1000,
			perfectionist: 2000,
			speed_demon: 500,
			social_butterfly: 750,
			influencer: 1500,
			streak_master: 5000
		};
		return points[badgeId as keyof typeof points] || 100;
	}

	private async trackAchievementEvent(event: { type: string; user_id: string; details: any }): Promise<void> {
		await supabase
			.from('achievement_events')
			.insert({
				event_type: event.type,
				user_id: event.user_id,
				event_data: event.details,
				created_at: new Date().toISOString()
			});
	}
}

// Singleton instance
export const gamificationService = new GamificationService();