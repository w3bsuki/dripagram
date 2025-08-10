import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		console.error('No session found - redirecting to login');
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	const conversationId = params.id;
	const userId = session.user.id;
	
	console.log('Loading conversation:', { conversationId, userId });

	// Fetch the conversation
	const { data: conversation, error: convError } = await supabase
		.from('conversations')
		.select('*')
		.eq('id', conversationId)
		.single();

	if (convError || !conversation) {
		console.error('Conversation not found:', convError);
		// Return minimal data to keep the page working
		return {
			conversationId,
			session,
			user: session.user,
			conversation: null,
			messages: []
		};
	}

	// Check if user is participant
	const isParticipant = 
		conversation.participant1_id === userId || 
		conversation.participant2_id === userId;

	if (!isParticipant) {
		console.error('User not participant');
		throw redirect(303, '/messages');
	}

	// Get other user ID
	const otherUserId = conversation.participant1_id === userId 
		? conversation.participant2_id 
		: conversation.participant1_id;

	// Fetch other user profile
	const { data: otherProfile } = await supabase
		.from('profiles')
		.select('id, username, avatar_url, verified')
		.eq('id', otherUserId)
		.single();

	// Load messages
	const { data: messages } = await supabase
		.from('messages')
		.select('*')
		.eq('conversation_id', conversationId)
		.order('created_at', { ascending: true })
		.limit(100);

	// Build conversation object
	const conversationData = {
		id: conversationId,
		participant1_id: conversation.participant1_id,
		participant2_id: conversation.participant2_id,
		other_user: otherProfile || {
			id: otherUserId,
			username: 'User',
			avatar_url: null,
			verified: false
		},
		product: null, // Skip product for now
		last_message_at: conversation.last_message_at,
		created_at: conversation.created_at
	};

	console.log('Returning conversation data:', conversationData);

	return {
		conversationId,
		session,
		user: session.user,
		conversation: conversationData,
		messages: messages || []
	};
};