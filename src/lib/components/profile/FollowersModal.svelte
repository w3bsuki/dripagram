<script lang="ts">
	import { X, UserCheck, UserPlus } from '@lucide/svelte';
	import { createEventDispatcher } from 'svelte';
	import { getSupabaseBrowserClient } from '$lib/supabase/client';
	import type { User } from '@supabase/supabase-js';

	interface UserInfo {
		id: string;
		username: string;
		full_name: string | null;
		avatar_url: string | null;
		verified: boolean;
		follower_count?: number;
		following_count?: number;
		is_following?: boolean;
	}

	let {
		isOpen = false,
		title = 'Followers',
		userId,
		currentUser,
		onClose
	}: {
		isOpen: boolean;
		title: string;
		userId: string;
		currentUser: User | null;
		onClose: () => void;
	} = $props();

	const dispatch = createEventDispatcher<{
		follow: { userId: string };
		unfollow: { userId: string };
	}>();

	let users = $state<UserInfo[]>([]);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	// Fetch followers or following based on title
	async function fetchUsers() {
		if (!userId) return;

		isLoading = true;
		error = null;

		try {
			const isFollowers = title.toLowerCase().includes('followers');
			
			const supabase = getSupabaseBrowserClient();
			const { data, error: fetchError } = await supabase
				.from('user_follows')
				.select(`
					${isFollowers ? 'follower_id' : 'following_id'},
					profiles!${isFollowers ? 'user_follows_follower_id_fkey' : 'user_follows_following_id_fkey'}(
						id,
						username,
						full_name,
						avatar_url,
						verified,
						follower_count,
						following_count
					)
				`)
				.eq(isFollowers ? 'following_id' : 'follower_id', userId);

			if (fetchError) throw fetchError;

			// Transform the data and check follow status for current user
			const userPromises = (data || []).map(async (item) => {
				const profile = item.profiles;
				let is_following = false;

				if (currentUser && profile.id !== currentUser.id) {
					const { data: followData } = await supabase
						.from('user_follows')
						.select('id')
						.eq('follower_id', currentUser.id)
						.eq('following_id', profile.id)
						.single();
					
					is_following = !!followData;
				}

				return {
					id: profile.id,
					username: profile.username,
					full_name: profile.full_name,
					avatar_url: profile.avatar_url,
					verified: profile.verified || false,
					follower_count: profile.follower_count || 0,
					following_count: profile.following_count || 0,
					is_following
				};
			});

			users = await Promise.all(userPromises);
		} catch (err) {
			console.error('Error fetching users:', err);
			error = 'Failed to load users. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	// Watch for changes to trigger fetch
	$effect(() => {
		if (isOpen && userId) {
			fetchUsers();
		}
	});

	async function handleFollowToggle(user: UserInfo) {
		if (!currentUser || user.id === currentUser.id) return;

		const supabase = getSupabaseBrowserClient();
		try {
			if (user.is_following) {
				// Unfollow
				await supabase
					.from('user_follows')
					.delete()
					.eq('follower_id', currentUser.id)
					.eq('following_id', user.id);

				user.is_following = false;
				dispatch('unfollow', { userId: user.id });
			} else {
				// Follow
				await supabase
					.from('user_follows')
					.insert({
						follower_id: currentUser.id,
						following_id: user.id
					});

				user.is_following = true;
				dispatch('follow', { userId: user.id });
			}

			// Update the user in the list
			users = users.map(u => u.id === user.id ? { ...u, is_following: user.is_following } : u);
		} catch (err) {
			console.error('Error toggling follow:', err);
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

<!-- Modal Backdrop -->
{#if isOpen}
	<div 
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={handleBackdropClick}
		role="dialog"
		aria-labelledby="modal-title"
		aria-modal="true"
	>
		<!-- Modal Content -->
		<div class="bg-white rounded-2xl max-w-md w-full max-h-[600px] flex flex-col">
			<!-- Header -->
			<div class="flex items-center justify-between p-4 border-b border-gray-200">
				<h2 id="modal-title" class="text-lg font-semibold text-gray-900">{title}</h2>
				<button 
					onclick={onClose}
					class="p-2 rounded-full hover:bg-gray-100 transition-colors"
					aria-label="Close modal"
				>
					<X size={20} />
				</button>
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto">
				{#if isLoading}
					<div class="p-6 text-center">
						<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
						<p class="text-gray-600">Loading...</p>
					</div>
				{:else if error}
					<div class="p-6 text-center">
						<p class="text-red-600">{error}</p>
						<button 
							onclick={fetchUsers}
							class="mt-2 text-primary hover:text-primary-dark"
						>
							Try again
						</button>
					</div>
				{:else if users.length === 0}
					<div class="p-6 text-center text-gray-500">
						<p>No {title.toLowerCase()} yet.</p>
					</div>
				{:else}
					<div class="divide-y divide-gray-100">
						{#each users as user (user.id)}
							<div class="p-4 flex items-center justify-between">
								<div class="flex items-center space-x-3">
									<!-- Avatar -->
									<div class="flex-shrink-0">
										{#if user.avatar_url}
											<img 
												src={user.avatar_url} 
												alt={user.username}
												class="w-12 h-12 rounded-full object-cover"
											/>
										{:else}
											<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
												{user.username?.charAt(0)?.toUpperCase() || 'U'}
											</div>
										{/if}
									</div>

									<!-- User Info -->
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-2">
											<p class="text-sm font-medium text-gray-900 truncate">
												{user.username}
											</p>
											{#if user.verified}
												<svg class="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
													<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
												</svg>
											{/if}
										</div>
										{#if user.full_name}
											<p class="text-sm text-gray-500 truncate">{user.full_name}</p>
										{/if}
										<p class="text-xs text-gray-400">
											{user.follower_count || 0} followers
										</p>
									</div>
								</div>

								<!-- Follow Button -->
								{#if currentUser && user.id !== currentUser.id}
									<button
										onclick={() => handleFollowToggle(user)}
										class="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors {
											user.is_following 
												? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
												: 'bg-primary text-white hover:bg-primary-600'
										}"
									>
										{#if user.is_following}
											<UserCheck size={16} />
											<span>Following</span>
										{:else}
											<UserPlus size={16} />
											<span>Follow</span>
										{/if}
									</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}