import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	const conversationId = params.id;
	const userId = session.user.id;

	try {
		// Fetch conversation details with participant info
		const { data: conversation, error: convError } = await supabase
			.from('conversation_participants')
			.select('*')
			.eq('conversation_id', conversationId)
			.single();

		if (convError || !conversation) {
			console.error('Conversation not found:', convError);
			throw redirect(303, '/messages');
		}

		// Check if the current user is part of this conversation
		const isParticipant = 
			conversation.participant1_id === userId || 
			conversation.participant2_id === userId;

		if (!isParticipant) {
			throw redirect(303, '/messages');
		}

		// Load messages for this conversation
		const { data: messages, error: messagesError } = await supabase
			.from('messages')
			.select('*')
			.eq('conversation_id', conversationId)
			.order('created_at', { ascending: true })
			.limit(100);

		if (messagesError) {
			console.error('Error loading messages:', messagesError);
		}

		// Mark messages as read
		await supabase
			.from('messages')
			.update({
				status: 'read',
				read_at: new Date().toISOString()
			})
			.eq('conversation_id', conversationId)
			.neq('sender_id', userId)
			.neq('status', 'read');

		// Get other participant details
		const isParticipant1 = conversation.participant1_id === userId;
		const otherUser = isParticipant1 
			? {
				id: conversation.participant2_id,
				username: conversation.participant2_username,
				avatar_url: conversation.participant2_avatar,
				verified: conversation.participant2_verified
			}
			: {
				id: conversation.participant1_id,
				username: conversation.participant1_username,
				avatar_url: conversation.participant1_avatar,
				verified: conversation.participant1_verified
			};

		// Get product details if exists
		const product = conversation.product_id ? {
			id: conversation.product_id,
			title: conversation.product_title,
			price: conversation.product_price,
			images: conversation.product_images
		} : null;

		return {
			conversationId,
			session,
			user: session.user,
			conversation: {
				id: conversationId,
				participant1_id: conversation.participant1_id,
				participant2_id: conversation.participant2_id,
				other_user: otherUser,
				product,
				last_message_at: conversation.last_message_at,
				created_at: conversation.created_at
			},
			messages: messages || []
		};
	} catch (err) {
		console.error('Error in conversation load:', err);
		// If any error occurs, redirect to messages list
		throw redirect(303, '/messages');
	}
};