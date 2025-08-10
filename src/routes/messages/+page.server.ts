import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	const user = session.user;

	// Fetch conversations directly from conversations table
	const { data: conversations, error: conversationsError } = await supabase
		.from('conversations')
		.select('*')
		.or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
		.order('created_at', { ascending: false });

	if (conversationsError) {
		console.error('Error fetching conversations:', conversationsError);
	}

	// Get participant IDs
	const participantIds = new Set<string>();
	conversations?.forEach(conv => {
		if (conv.participant1_id !== user.id) participantIds.add(conv.participant1_id);
		if (conv.participant2_id !== user.id) participantIds.add(conv.participant2_id);
	});

	// Fetch profiles for all participants
	const { data: profiles } = await supabase
		.from('profiles')
		.select('id, username, avatar_url, verified')
		.in('id', Array.from(participantIds));

	const profileMap = new Map();
	profiles?.forEach(profile => {
		profileMap.set(profile.id, profile);
	});

	// Fetch messages for all conversations
	const conversationIds = conversations?.map(c => c.id) || [];
	
	let messages: any[] = [];
	if (conversationIds.length > 0) {
		const { data: messagesData } = await supabase
			.from('messages')
			.select('*')
			.in('conversation_id', conversationIds)
			.order('created_at', { ascending: false });

		messages = messagesData || [];
	}

	// Group messages by conversation and get the latest one
	const lastMessages = new Map();
	const unreadCounts = new Map();
	
	messages.forEach(msg => {
		// Get last message
		if (!lastMessages.has(msg.conversation_id)) {
			lastMessages.set(msg.conversation_id, msg);
		}
		
		// Count unread messages
		if (msg.status === 'sent' && msg.sender_id !== user.id) {
			const currentCount = unreadCounts.get(msg.conversation_id) || 0;
			unreadCounts.set(msg.conversation_id, currentCount + 1);
		}
	});

	// Process conversations with additional data
	const processedConversations = (conversations || []).map(conv => {
		const otherUserId = conv.participant1_id === user.id ? conv.participant2_id : conv.participant1_id;
		const otherProfile = profileMap.get(otherUserId) || {};
		
		const lastMessage = lastMessages.get(conv.id);

		return {
			id: conv.id,
			buyer_id: conv.participant1_id, // Map participant1_id to buyer_id
			seller_id: conv.participant2_id, // Map participant2_id to seller_id
			product_id: conv.product_id,
			last_message_at: lastMessage?.created_at || conv.created_at,
			status: 'active' as const, // Default status
			created_at: conv.created_at,
			updated_at: conv.updated_at || conv.created_at, // Fallback to created_at if updated_at is missing
			other_user: {
				id: otherUserId,
				username: otherProfile.username || 'User',
				avatar_url: otherProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherProfile.username || 'U')}&background=random`,
				verified: otherProfile.verified || false
			},
			product: conv.product_id ? {
				id: conv.product_id,
				title: 'Product',
				price: 0,
				images: []
			} : undefined,
			last_message: lastMessage || null,
			unread_count: unreadCounts.get(conv.id) || 0
		};
	});

	return {
		session,
		user: session.user,
		conversations: processedConversations
	};
};