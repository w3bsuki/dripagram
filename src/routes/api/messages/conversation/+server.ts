import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const { otherUserId, productId } = await request.json();
		
		if (!otherUserId) {
			return json({ error: 'Other user ID is required' }, { status: 400 });
		}
		
		const userId = session.user.id;
		
		// Ensure consistent ordering of participants
		const participant1Id = userId < otherUserId ? userId : otherUserId;
		const participant2Id = userId < otherUserId ? otherUserId : userId;
		
		// Check if conversation already exists
		const { data: existingConversation } = await supabase
			.from('conversations')
			.select('id')
			.eq('participant1_id', participant1Id)
			.eq('participant2_id', participant2Id)
			.maybeSingle();
		
		if (existingConversation) {
			return json({ conversationId: existingConversation.id });
		}
		
		// Create new conversation
		const { data: newConversation, error: createError } = await supabase
			.from('conversations')
			.insert({
				participant1_id: participant1Id,
				participant2_id: participant2Id,
				product_id: productId || null
			})
			.select('id')
			.single();
		
		if (createError) {
			console.error('Error creating conversation:', createError);
			return json({ error: 'Failed to create conversation' }, { status: 500 });
		}
		
		return json({ conversationId: newConversation.id });
	} catch (error) {
		console.error('Error in conversation endpoint:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};