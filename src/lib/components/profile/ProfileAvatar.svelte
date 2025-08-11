<script lang="ts">
	interface Props {
		avatarUrl?: string;
		username: string;
		fullName?: string;
		size?: 'sm' | 'md' | 'lg';
		isBrand?: boolean;
	}

	let { avatarUrl, username, fullName, size = 'lg', isBrand = false }: Props = $props();

	function getInitials(name: string): string {
		if (!name || name.trim() === '') return 'U';
		const parts = name.trim().split(' ').filter(part => part.length > 0);
		if (parts.length === 0) return 'U';
		if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
		return parts.slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
	}

	const sizeClasses = {
		sm: 'w-12 h-12 text-sm',
		md: 'w-20 h-20 text-xl',
		lg: 'w-36 h-36 text-4xl'
	};
</script>

<div class="profile-avatar {sizeClasses[size]}">
	{#if avatarUrl}
		<img 
			src={avatarUrl} 
			alt={username}
			class="avatar-image"
		/>
	{:else}
		<div class="avatar-placeholder">
			<span class="avatar-initials">
				{getInitials(fullName || username)}
			</span>
		</div>
	{/if}
	{#if isBrand}
		<div class="verified-badge">
			<svg fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
			</svg>
		</div>
	{/if}
</div>

<style>
	.profile-avatar {
		position: relative;
		flex-shrink: 0;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: #405de6;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-initials {
		color: white;
		font-weight: 600;
	}

	.verified-badge {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 20px;
		height: 20px;
		background: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #3897f0;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}

	.verified-badge svg {
		width: 12px;
		height: 12px;
	}
</style>