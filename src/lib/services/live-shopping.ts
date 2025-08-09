/**
 * Live Shopping Service - Real-time video commerce features
 * Enables sellers to host live product demonstrations with Q&A
 * Part of Phase 5C: Market Leadership Features
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '$lib/supabase/client';
const supabase = createClient();

export interface LiveSession {
	id: string;
	seller_id: string;
	product_id: string;
	title: string;
	description: string;
	scheduled_for: string;
	started_at?: string;
	ended_at?: string;
	status: 'scheduled' | 'live' | 'ended';
	viewer_count: number;
	stream_url?: string;
	chat_enabled: boolean;
	created_at: string;
	seller?: {
		id: string;
		username: string;
		avatar_url?: string;
		verified: boolean;
	};
	product?: {
		id: string;
		title: string;
		price: number;
		images: string[];
	};
}

export interface LiveMessage {
	id: string;
	session_id: string;
	user_id: string;
	message: string;
	message_type: 'chat' | 'question' | 'system' | 'purchase';
	created_at: string;
	user?: {
		username: string;
		avatar_url?: string;
	};
}

export interface GroupBuyingOffer {
	id: string;
	product_id: string;
	session_id?: string;
	min_quantity: number;
	discount_percentage: number;
	expires_at: string;
	current_participants: number;
	status: 'active' | 'completed' | 'expired';
	created_at: string;
}

export interface ViewerStats {
	current_viewers: number;
	peak_viewers: number;
	total_views: number;
	messages_count: number;
	questions_count: number;
	purchases_count: number;
}

export class LiveShoppingService {
	private channel: RealtimeChannel | null = null;
	private sessionId: string | null = null;

	/**
	 * Start a live shopping session
	 */
	async startLiveSession(productId: string, sessionData: {
		title: string;
		description: string;
		scheduled_for?: string;
	}): Promise<LiveSession> {
		const { data: session, error } = await supabase
			.from('live_sessions')
			.insert({
				product_id: productId,
				title: sessionData.title,
				description: sessionData.description,
				scheduled_for: sessionData.scheduled_for || new Date().toISOString(),
				status: 'live',
				started_at: new Date().toISOString(),
				chat_enabled: true,
				viewer_count: 0
			})
			.select(`
				*,
				seller:profiles!seller_id (
					id, username, avatar_url, verified
				),
				product:products (
					id, title, price, images
				)
			`)
			.single();

		if (error) throw error;

		// Join the live session channel
		await this.joinSession(session.id);

		// Track analytics
		await this.trackEvent('live_session_started', {
			session_id: session.id,
			product_id: productId,
			title: sessionData.title
		});

		return session;
	}

	/**
	 * Join a live session as a viewer
	 */
	async joinSession(sessionId: string): Promise<void> {
		this.sessionId = sessionId;
		
		// Leave existing channel if any
		if (this.channel) {
			await supabase.removeChannel(this.channel);
		}

		// Join the session channel
		this.channel = supabase
			.channel(`live_session_${sessionId}`)
			.on('postgres_changes', {
				event: 'INSERT',
				schema: 'public',
				table: 'live_messages',
				filter: `session_id=eq.${sessionId}`
			}, (payload) => {
				this.handleNewMessage(payload.new as LiveMessage);
			})
			.on('postgres_changes', {
				event: 'UPDATE',
				schema: 'public',
				table: 'live_sessions',
				filter: `id=eq.${sessionId}`
			}, (payload) => {
				this.handleSessionUpdate(payload.new as LiveSession);
			})
			.on('presence', { event: 'sync' }, () => {
				this.updateViewerCount();
			})
			.on('presence', { event: 'join' }, () => {
				this.updateViewerCount();
			})
			.on('presence', { event: 'leave' }, () => {
				this.updateViewerCount();
			});

		await this.channel.subscribe((status) => {
			if (status === 'SUBSCRIBED') {
				// Track viewer join
				this.channel?.track({
					user_id: (supabase.auth.getUser() as any)?.data?.user?.id,
					joined_at: new Date().toISOString()
				});
			}
		});

		// Increment viewer count in database
		await supabase.rpc('increment_viewer_count', { session_id: sessionId });
	}

	/**
	 * Send a chat message during live session
	 */
	async sendMessage(message: string, messageType: 'chat' | 'question' = 'chat'): Promise<void> {
		if (!this.sessionId) throw new Error('Not connected to a live session');

		const user = (await supabase.auth.getUser()).data.user;
		if (!user) throw new Error('User not authenticated');

		const { error } = await supabase
			.from('live_messages')
			.insert({
				session_id: this.sessionId,
				user_id: user.id,
				message,
				message_type: messageType
			});

		if (error) throw error;

		// Track analytics
		await this.trackEvent('live_message_sent', {
			session_id: this.sessionId,
			message_type: messageType,
			message_length: message.length
		});
	}

	/**
	 * Ask a question during live session
	 */
	async askQuestion(question: string): Promise<void> {
		await this.sendMessage(question, 'question');
	}

	/**
	 * Create group buying offer for live session
	 */
	async createGroupBuyingOffer(offer: {
		min_quantity: number;
		discount_percentage: number;
		duration_minutes: number;
	}): Promise<GroupBuyingOffer> {
		if (!this.sessionId) throw new Error('Not connected to a live session');

		// Get current session info
		const { data: session } = await supabase
			.from('live_sessions')
			.select('product_id')
			.eq('id', this.sessionId)
			.single();

		if (!session) throw new Error('Session not found');

		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + offer.duration_minutes);

		const { data: groupOffer, error } = await supabase
			.from('group_buying_offers')
			.insert({
				product_id: session.product_id,
				session_id: this.sessionId,
				min_quantity: offer.min_quantity,
				discount_percentage: offer.discount_percentage,
				expires_at: expiresAt.toISOString(),
				status: 'active',
				current_participants: 0
			})
			.select()
			.single();

		if (error) throw error;

		// Notify all viewers about the group offer
		await this.sendSystemMessage(`🎉 Group Buy Alert! Get ${offer.discount_percentage}% off when we reach ${offer.min_quantity} buyers! Time remaining: ${offer.duration_minutes} minutes`);

		// Track analytics
		await this.trackEvent('group_buying_offer_created', {
			session_id: this.sessionId,
			offer_id: groupOffer.id,
			min_quantity: offer.min_quantity,
			discount_percentage: offer.discount_percentage
		});

		return groupOffer;
	}

	/**
	 * Join a group buying offer
	 */
	async joinGroupBuying(offerId: string): Promise<{ success: boolean; participants: number }> {
		const user = (await supabase.auth.getUser()).data.user;
		if (!user) throw new Error('User not authenticated');

		// Check if already participating
		const { data: existing } = await supabase
			.from('group_buying_participants')
			.select('id')
			.eq('offer_id', offerId)
			.eq('user_id', user.id)
			.single();

		if (existing) {
			return { success: false, participants: 0 };
		}

		// Add participant
		const { error } = await supabase
			.from('group_buying_participants')
			.insert({
				offer_id: offerId,
				user_id: user.id
			});

		if (error) throw error;

		// Update participant count
		const { data: updated } = await supabase.rpc('increment_group_participants', { offer_id: offerId });

		// Check if minimum reached
		const { data: offer } = await supabase
			.from('group_buying_offers')
			.select('min_quantity, current_participants, product_id')
			.eq('id', offerId)
			.single();

		if (offer && offer.current_participants >= offer.min_quantity) {
			// Activate the deal for all participants
			await this.sendSystemMessage(`🔥 Group Buy SUCCESS! The deal is now active for all ${offer.current_participants} participants!`);
			
			// Update offer status
			await supabase
				.from('group_buying_offers')
				.update({ status: 'completed' })
				.eq('id', offerId);
		}

		return { success: true, participants: updated || 0 };
	}

	/**
	 * Get live session statistics
	 */
	async getSessionStats(sessionId: string): Promise<ViewerStats> {
		const [
			{ data: session },
			{ data: messages },
			{ data: questions },
			{ data: purchases }
		] = await Promise.all([
			supabase.from('live_sessions').select('viewer_count, peak_viewer_count, total_views').eq('id', sessionId).single(),
			supabase.from('live_messages').select('id').eq('session_id', sessionId).eq('message_type', 'chat'),
			supabase.from('live_messages').select('id').eq('session_id', sessionId).eq('message_type', 'question'),
			supabase.from('live_messages').select('id').eq('session_id', sessionId).eq('message_type', 'purchase')
		]);

		return {
			current_viewers: session?.viewer_count || 0,
			peak_viewers: session?.peak_viewer_count || 0,
			total_views: session?.total_views || 0,
			messages_count: messages?.length || 0,
			questions_count: questions?.length || 0,
			purchases_count: purchases?.length || 0
		};
	}

	/**
	 * End live session
	 */
	async endSession(): Promise<void> {
		if (!this.sessionId) throw new Error('Not connected to a live session');

		// Update session status
		await supabase
			.from('live_sessions')
			.update({
				status: 'ended',
				ended_at: new Date().toISOString()
			})
			.eq('id', this.sessionId);

		// Send system message
		await this.sendSystemMessage('📺 Live session has ended. Thank you for watching!');

		// Leave channel
		if (this.channel) {
			await supabase.removeChannel(this.channel);
			this.channel = null;
		}

		// Track analytics
		await this.trackEvent('live_session_ended', {
			session_id: this.sessionId
		});

		this.sessionId = null;
	}

	/**
	 * Get active live sessions
	 */
	async getActiveSessions(): Promise<LiveSession[]> {
		const { data: sessions, error } = await supabase
			.from('live_sessions')
			.select(`
				*,
				seller:profiles!seller_id (
					id, username, avatar_url, verified
				),
				product:products (
					id, title, price, images
				)
			`)
			.eq('status', 'live')
			.order('viewer_count', { ascending: false })
			.limit(20);

		if (error) throw error;
		return sessions || [];
	}

	/**
	 * Get session messages
	 */
	async getSessionMessages(sessionId: string, limit = 50): Promise<LiveMessage[]> {
		const { data: messages, error } = await supabase
			.from('live_messages')
			.select(`
				*,
				user:profiles!user_id (
					username, avatar_url
				)
			`)
			.eq('session_id', sessionId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;
		return messages || [];
	}

	/**
	 * Get social proof metrics for amplification
	 */
	async getSocialProofMetrics(productId: string): Promise<{
		recent_purchases: number;
		live_viewers: number;
		interest_score: number;
		trending_rank?: number;
	}> {
		const [
			{ data: recentPurchases },
			{ data: liveSessions },
			{ data: engagement }
		] = await Promise.all([
			supabase.from('purchases').select('id').eq('product_id', productId).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
			supabase.from('live_sessions').select('viewer_count').eq('product_id', productId).eq('status', 'live'),
			supabase.from('product_engagement').select('view_count, like_count').eq('id', productId).single()
		]);

		const recentPurchaseCount = recentPurchases?.length || 0;
		const currentViewers = liveSessions?.reduce((sum, session) => sum + (session.viewer_count || 0), 0) || 0;
		const interestScore = ((engagement?.view_count || 0) * 0.1) + ((engagement?.like_count || 0) * 2) + (recentPurchaseCount * 10);

		return {
			recent_purchases: recentPurchaseCount,
			live_viewers: currentViewers,
			interest_score: Math.round(interestScore),
			trending_rank: interestScore > 100 ? Math.floor(Math.random() * 10) + 1 : undefined
		};
	}

	// Private helper methods
	private async sendSystemMessage(message: string): Promise<void> {
		if (!this.sessionId) return;

		await supabase
			.from('live_messages')
			.insert({
				session_id: this.sessionId,
				user_id: 'system',
				message,
				message_type: 'system'
			});
	}

	private handleNewMessage(message: LiveMessage): void {
		// Handle new message received via real-time
		// This can be used to update UI in real-time
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('liveChatMessage', { detail: message }));
		}
	}

	private handleSessionUpdate(session: LiveSession): void {
		// Handle session updates via real-time
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('liveSessionUpdate', { detail: session }));
		}
	}

	private async updateViewerCount(): Promise<void> {
		if (!this.channel || !this.sessionId) return;

		const presence = this.channel.presenceState();
		const viewerCount = Object.keys(presence).length;

		await supabase.rpc('update_session_viewers', { 
			session_id: this.sessionId, 
			viewer_count: viewerCount 
		});
	}

	private async trackEvent(eventName: string, properties: Record<string, any>): Promise<void> {
		try {
			await supabase.from('analytics_events').insert({
				event_name: eventName,
				event_properties: properties,
				url: window.location.href,
				user_agent: navigator.userAgent,
				created_at: new Date().toISOString()
			});
		} catch (error) {
			console.error('Failed to track live shopping event:', error);
		}
	}

	/**
	 * Clean up resources
	 */
	destroy(): void {
		if (this.channel) {
			supabase.removeChannel(this.channel);
			this.channel = null;
		}
		this.sessionId = null;
	}
}

// Singleton instance
export const liveShoppingService = new LiveShoppingService();