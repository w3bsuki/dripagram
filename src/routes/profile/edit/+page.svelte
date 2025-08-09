<script lang="ts">
	import { goto } from '$app/navigation';
	import { Camera, ArrowLeft } from '@lucide/svelte';
	import type { PageData } from './$types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let uploading = $state(false);
	let message = $state('');
	let avatarInput: HTMLInputElement;
	
	let profile = $state({
		username: data.user?.user_metadata?.username || data.user?.email?.split('@')[0] || '',
		full_name: data.user?.user_metadata?.full_name || '',
		bio: data.user?.user_metadata?.bio || '',
		avatar_url: data.user?.user_metadata?.avatar_url || '',
	});

	function getInitials(name: string): string {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
	}

	async function uploadAvatar(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (!file || !data.user) {
			return;
		}

		const fileExt = file.name.split('.').pop();
		const fileName = `${data.user.id}-${Math.random()}.${fileExt}`;
		const filePath = `avatars/${fileName}`;

		try {
			uploading = true;
			message = '';

			// Upload file to Supabase Storage
			const { error: uploadError, data: uploadData } = await data.supabase.storage
				.from('profile-images')
				.upload(filePath, file);

			if (uploadError) {
				throw uploadError;
			}

			// Get the public URL
			const { data: urlData } = data.supabase.storage
				.from('profile-images')
				.getPublicUrl(filePath);

			if (urlData.publicUrl) {
				profile.avatar_url = urlData.publicUrl;
				message = 'Avatar uploaded successfully!';
			}

		} catch (error) {
			message = 'Error uploading avatar. Please try again.';
		} finally {
			uploading = false;
		}
	}

	async function updateProfile(event: Event) {
		event.preventDefault();
		if (!data.session) return;

		loading = true;
		message = '';

		try {
			// Update the user metadata
			const { error } = await data.supabase.auth.updateUser({
				data: {
					username: profile.username,
					full_name: profile.full_name,
					bio: profile.bio,
					avatar_url: profile.avatar_url,
				},
			});

			if (error) throw error;

			// Also update the profiles table
			const { error: profileError } = await data.supabase
				.from('profiles')
				.update({
					username: profile.username,
					full_name: profile.full_name,
					bio: profile.bio,
					avatar_url: profile.avatar_url,
					updated_at: new Date().toISOString()
				})
				.eq('id', data.user!.id);

			if (profileError) {
			}

			message = 'Profile updated successfully!';
			setTimeout(() => {
				goto('/profile');
			}, 1500);
		} catch (error) {
			message = 'Error updating profile. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="edit-profile-page">
	<!-- Header -->
	<header class="edit-header">
		<div class="header-content">
			<button 
				onclick={() => goto('/profile')}
				class="back-btn"
				aria-label="Cancel"
			>
				<ArrowLeft size={24} />
			</button>
			<h1 class="header-title">Edit Profile</h1>
			<button 
				onclick={updateProfile}
				disabled={loading}
				class="save-btn"
			>
				{loading ? 'Saving...' : 'Done'}
			</button>
		</div>
	</header>

	<div class="edit-content">
		<!-- Avatar Section -->
		<div class="avatar-section">
			<div class="avatar-container">
				{#if profile.avatar_url}
					<img 
						src={profile.avatar_url} 
						alt="Profile"
						class="avatar"
					/>
				{:else}
					<div class="avatar avatar-placeholder">
						<span class="initials">
							{getInitials(profile.full_name || profile.username)}
						</span>
					</div>
				{/if}
				
				<button 
					onclick={() => avatarInput?.click()}
					disabled={uploading}
					class="change-photo-btn"
				>
					<Camera size={16} />
					{uploading ? 'Uploading...' : 'Change Profile Photo'}
				</button>
				
				<input
					bind:this={avatarInput}
					type="file"
					accept="image/*"
					onchange={uploadAvatar}
					class="avatar-input"
				/>
			</div>
		</div>

		<!-- Form Fields -->
		<form onsubmit={updateProfile} class="edit-form">
			<div class="form-group">
				<label for="username" class="form-label">Username</label>
				<input
					id="username"
					type="text"
					bind:value={profile.username}
					placeholder="username"
					required
					class="form-input"
				/>
			</div>

			<div class="form-group">
				<label for="full_name" class="form-label">Name</label>
				<input
					id="full_name"
					type="text"
					bind:value={profile.full_name}
					placeholder="Name"
					class="form-input"
				/>
			</div>

			<div class="form-group">
				<label for="bio" class="form-label">Bio</label>
				<textarea
					id="bio"
					bind:value={profile.bio}
					placeholder="Bio"
					maxlength="150"
					rows="3"
					class="form-textarea"
				></textarea>
				<div class="char-count">{profile.bio.length}/150</div>
			</div>

			{#if message}
				<div class="message {message.includes('Error') ? 'error' : 'success'}">
					{message}
				</div>
			{/if}
		</form>
	</div>
</div>

<style>
	.edit-profile-page {
		min-height: 100vh;
		background: var(--color-background);
		padding-bottom: 60px; /* Space for bottom nav */
	}
	
	/* Header */
	.edit-header {
		position: sticky;
		top: 0;
		z-index: var(--z-higher);
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		padding: 12px 16px;
	}
	
	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.back-btn {
		background: none;
		border: none;
		color: var(--color-foreground);
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.header-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin: 0;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
	}
	
	.save-btn {
		background: none;
		border: none;
		color: #0095f6;
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		padding: 4px 8px;
	}
	
	.save-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	/* Content */
	.edit-content {
		max-width: 600px;
		margin: 0 auto;
	}
	
	/* Avatar Section */
	.avatar-section {
		display: flex;
		justify-content: center;
		padding: 32px 16px;
		border-bottom: 1px solid var(--color-border);
	}
	
	.avatar-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}
	
	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-border);
	}
	
	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}
	
	.initials {
		font-size: var(--font-size-3xl);
		font-weight: 600;
		text-transform: uppercase;
	}
	
	.change-photo-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: #0095f6;
		font-size: var(--font-size-sm);
		font-weight: 600;
		cursor: pointer;
		padding: 4px;
	}
	
	.change-photo-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.avatar-input {
		display: none;
	}
	
	/* Form */
	.edit-form {
		padding: 0 16px;
	}
	
	.form-group {
		display: flex;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid var(--color-border);
	}
	
	.form-group:last-of-type {
		border-bottom: none;
	}
	
	.form-label {
		width: 100px;
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-foreground);
		flex-shrink: 0;
	}
	
	.form-input,
	.form-textarea {
		flex: 1;
		background: none;
		border: none;
		font-size: var(--font-size-base);
		padding: 8px 12px;
		color: var(--color-foreground);
		margin-left: 16px;
	}
	
	.form-input:focus,
	.form-textarea:focus {
		outline: none;
	}
	
	.form-input::placeholder,
	.form-textarea::placeholder {
		color: var(--color-muted-foreground);
	}
	
	.form-textarea {
		resize: vertical;
		min-height: 60px;
		font-family: inherit;
	}
	
	.char-count {
		position: absolute;
		right: 16px;
		bottom: 8px;
		font-size: var(--font-size-xs);
		color: var(--color-muted-foreground);
	}
	
	/* Message */
	.message {
		margin: 16px;
		padding: 12px;
		border-radius: 8px;
		text-align: center;
		font-size: var(--font-size-sm);
	}
	
	.message.success {
		background: #e8f5e8;
		color: #2d7d32;
		border: 1px solid #81c784;
	}
	
	.message.error {
		background: #ffebee;
		color: #c62828;
		border: 1px solid #ef5350;
	}
	
	/* Mobile optimization */
	@media (min-width: 640px) {
		.avatar {
			width: 100px;
			height: 100px;
		}
		
		.initials {
			font-size: var(--font-size-4xl);
		}
	}
</style>
