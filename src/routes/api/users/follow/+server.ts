import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	
	if (!session || !user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { targetUserId, action } = await request.json();
		
		if (!targetUserId || !action) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		if (targetUserId === user.id) {
			return json({ error: 'Cannot follow yourself' }, { status: 400 });
		}

		if (action === 'follow') {
			// Create follow relationship
			const { error: followError } = await locals.supabase
				.from('user_follows')
				.insert({
					follower_id: user.id,
					following_id: targetUserId
				});

			if (followError) {
				// Check if already following
				if (followError.code === '23505') {
					return json({ error: 'Already following this user' }, { status: 400 });
				}
				throw followError;
			}

		} else if (action === 'unfollow') {
			// Remove follow relationship
			const { error: unfollowError } = await locals.supabase
				.from('user_follows')
				.delete()
				.eq('follower_id', user.id)
				.eq('following_id', targetUserId);

			if (unfollowError) {
				throw unfollowError;
			}
		} else {
			return json({ error: 'Invalid action' }, { status: 400 });
		}

		// Get updated follower count
		const { data: targetProfile } = await locals.supabase
			.from('profiles')
			.select('follower_count')
			.eq('id', targetUserId)
			.single();

		// Check if still following
		const { data: followData } = await locals.supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', targetUserId)
			.single();

		return json({
			success: true,
			isFollowing: !!followData,
			followerCount: targetProfile?.follower_count || 0
		});

	} catch (error) {
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};