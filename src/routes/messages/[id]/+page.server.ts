import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();

	if (!session) {
		throw redirect(303, '/auth/login?redirectTo=/messages');
	}

	const conversationId = params.id;

	try {
		// Verify the user has access to this conversation
		const { data: conversation, error } = await supabase
			.from('conversations')
			.select('buyer_id, seller_id')
			.eq('id', conversationId)
			.single();

		if (error || !conversation) {
			throw redirect(303, '/messages');
		}

		// Check if the current user is part of this conversation
		const isParticipant = 
			conversation.buyer_id === session.user.id || 
			conversation.seller_id === session.user.id;

		if (!isParticipant) {
			throw redirect(303, '/messages');
		}

		return {
			conversationId,
			session,
			user: session.user,
		};
	} catch (err) {
		// If any error occurs, redirect to messages list
		throw redirect(303, '/messages');
	}
};