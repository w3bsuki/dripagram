import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	
	if (!session) {
		console.error('No session found in conversation endpoint');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	
	try {
		const { otherUserId, productId } = await request.json();
		
		console.log('Creating conversation:', { 
			currentUserId: session.user.id, 
			otherUserId, 
			productId 
		});
		
		if (!otherUserId) {
			return json({ error: 'Other user ID is required' }, { status: 400 });
		}
		
		if (otherUserId === session.user.id) {
			return json({ error: 'Cannot create conversation with yourself' }, { status: 400 });
		}
		
		const userId = session.user.id;
		
		// Ensure consistent ordering of participants
		const participant1Id = userId < otherUserId ? userId : otherUserId;
		const participant2Id = userId < otherUserId ? otherUserId : userId;
		
		// Check if conversation already exists - get the most recent one
		const { data: existingConversations, error: checkError } = await supabase
			.from('conversations')
			.select('id')
			.eq('participant1_id', participant1Id)
			.eq('participant2_id', participant2Id)
			.order('created_at', { ascending: false })
			.limit(1);
		
		if (checkError) {
			console.error('Error checking existing conversation:', checkError);
		}
		
		if (existingConversations && existingConversations.length > 0) {
			console.log('Found existing conversation:', existingConversations[0].id);
			return json({ conversationId: existingConversations[0].id });
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
			return json({ 
				error: 'Failed to create conversation', 
				details: createError.message 
			}, { status: 500 });
		}
		
		console.log('Created new conversation:', newConversation.id);
		return json({ conversationId: newConversation.id });
	} catch (error) {
		console.error('Error in conversation endpoint:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};