import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	const user = session.user;

	// Fetch conversations with participant details and last message
	const { data: conversations, error: conversationsError } = await supabase
		.from('conversation_participants')
		.select('*')
		.or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
		.order('last_message_at', { ascending: false });

	if (conversationsError) {
		console.error('Error fetching conversations:', conversationsError);
		throw error(500, 'Failed to load conversations');
	}

	// Fetch last messages for each conversation
	const conversationIds = conversations?.map(c => c.conversation_id) || [];
	
	let messages: any[] = [];
	if (conversationIds.length > 0) {
		const { data: messagesData, error: messagesError } = await supabase
			.from('messages')
			.select('*')
			.in('conversation_id', conversationIds)
			.order('created_at', { ascending: false });

		if (messagesError) {
			console.error('Error fetching messages:', messagesError);
		} else {
			messages = messagesData || [];
		}
	}

	// Group messages by conversation and get the latest one
	const lastMessages = new Map();
	messages.forEach(msg => {
		if (!lastMessages.has(msg.conversation_id)) {
			lastMessages.set(msg.conversation_id, msg);
		}
	});

	// Get unread counts for each conversation
	const unreadCounts = new Map();
	for (const conv of conversations || []) {
		const { count } = await supabase
			.from('messages')
			.select('*', { count: 'exact', head: true })
			.eq('conversation_id', conv.conversation_id)
			.eq('status', 'sent')
			.neq('sender_id', user.id);

		unreadCounts.set(conv.conversation_id, count || 0);
	}

	// Process conversations with additional data
	const processedConversations = (conversations || []).map(conv => {
		const isParticipant1 = conv.participant1_id === user.id;
		const otherUser = isParticipant1 
			? {
				id: conv.participant2_id,
				username: conv.participant2_username,
				avatar_url: conv.participant2_avatar,
				verified: conv.participant2_verified
			}
			: {
				id: conv.participant1_id,
				username: conv.participant1_username,
				avatar_url: conv.participant1_avatar,
				verified: conv.participant1_verified
			};

		return {
			id: conv.conversation_id,
			participant1_id: conv.participant1_id,
			participant2_id: conv.participant2_id,
			other_user: otherUser,
			product: conv.product_id ? {
				id: conv.product_id,
				title: conv.product_title,
				price: conv.product_price,
				images: conv.product_images
			} : null,
			last_message: lastMessages.get(conv.conversation_id) || null,
			unread_count: unreadCounts.get(conv.conversation_id) || 0,
			last_message_at: conv.last_message_at,
			created_at: conv.created_at
		};
	});

	return {
		session,
		user: session.user,
		conversations: processedConversations
	};
};