<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext } from 'svelte';
	import type { PageData } from './$types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let { data }: { data: PageData } = $props();

	// Get supabase client from parent context - we'll use page data instead
	import { page } from '$app/stores';
	let supabase = $derived($page.data.supabase as SupabaseClient);

	let loading = $state(false);
	let message = $state('');
	let profile = $state({
		username: data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || '',
		full_name: data.user?.user_metadata?.full_name || '',
		bio: data.user?.user_metadata?.bio || '',
		avatar_url: data.user?.user_metadata?.avatar_url || '',
	});

	async function updateProfile(event: Event) {
		event.preventDefault();
		if (!data.session) return;

		loading = true;
		message = '';

		try {
			// Update the user metadata
			const { error } = await supabase.auth.updateUser({
				data: {
					username: profile.username,
					full_name: profile.full_name,
					bio: profile.bio,
					avatar_url: profile.avatar_url,
				},
			});

			if (error) throw error;

			message = 'Profile updated successfully!';
			setTimeout(() => {
				goto('/profile');
			}, 1500);
		} catch (error) {
			console.error('Error updating profile:', error);
			message = 'Error updating profile. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="edit-profile-page">
	<div class="header">
		<h1>Edit Profile</h1>
		<a href="/profile" class="cancel-btn">Cancel</a>
	</div>

	<form onsubmit={updateProfile} class="edit-form">
		<!-- Avatar Preview -->
		<div class="avatar-section">
			<img
				src={profile.avatar_url ||
					`https://ui-avatars.com/api/?name=${profile.username || 'User'}&background=1877f2&color=fff`}
				alt="Profile"
				class="avatar-preview"
			/>
			<p class="avatar-hint">Profile photo</p>
		</div>

		<!-- Form Fields -->
		<div class="form-group">
			<label for="username">Username</label>
			<input
				id="username"
				type="text"
				bind:value={profile.username}
				placeholder="your_username"
				required
				class="form-input"
			/>
		</div>

		<div class="form-group">
			<label for="full_name">Full Name</label>
			<input
				id="full_name"
				type="text"
				bind:value={profile.full_name}
				placeholder="Your Full Name"
				class="form-input"
			/>
		</div>

		<div class="form-group">
			<label for="bio">Bio</label>
			<textarea
				id="bio"
				bind:value={profile.bio}
				placeholder="Tell people about yourself..."
				maxlength="150"
				rows="3"
				class="form-textarea"
			></textarea>
			<span class="char-count">{profile.bio.length}/150</span>
		</div>

		<div class="form-group">
			<label for="avatar_url">Avatar URL</label>
			<input
				id="avatar_url"
				type="url"
				bind:value={profile.avatar_url}
				placeholder="https://example.com/your-photo.jpg"
				class="form-input"
			/>
		</div>

		{#if message}
			<div class="message {message.includes('Error') ? 'error' : 'success'}">
				{message}
			</div>
		{/if}

		<div class="form-actions">
			<button type="submit" disabled={loading} class="btn-primary">
				{loading ? 'Saving...' : 'Save Changes'}
			</button>
		</div>
	</form>
</div>

<style>
	.edit-profile-page {
		max-width: 500px;
		margin: 0 auto;
		padding: 1rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.cancel-btn {
		color: var(--color-text-secondary);
		text-decoration: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		transition: background 0.2s;
	}

	.cancel-btn:hover {
		background: var(--color-surface-secondary);
	}

	.edit-form {
		background: var(--color-surface-primary);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: var(--shadow-sm);
	}

	.avatar-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.avatar-preview {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-border-primary);
		margin-bottom: 0.5rem;
	}

	.avatar-hint {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.form-input,
	.form-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-border-primary);
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: var(--color-interactive-primary);
	}

	.form-textarea {
		resize: vertical;
		min-height: 80px;
	}

	.char-count {
		display: block;
		text-align: right;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin-top: 0.25rem;
	}

	.message {
		padding: 0.75rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.message.success {
		background: var(--color-surface-brand-subtle);
		color: var(--color-text-success);
		border: 1px solid var(--color-border-success);
	}

	.message.error {
		background: var(--color-surface-error);
		color: var(--color-text-error);
		border: 1px solid var(--color-border-error);
	}

	.form-actions {
		text-align: center;
	}

	.btn-primary {
		background: var(--color-interactive-primary);
		color: var(--color-text-inverse);
		padding: 0.75rem 2rem;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-interactive-primary-hover);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
