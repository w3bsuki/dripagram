<script lang="ts">
	import { Check, Star } from '@lucide/svelte';
	import StoryRing from './StoryRing.svelte';
	
	interface Props {
		avatar: string;
		username: string;
		subtitle?: string;
		verified?: boolean;
		rating_average?: number;
		rating_count?: number;
		hasStory?: boolean;
		storyViewed?: boolean;
		size?: 'sm' | 'md' | 'lg';
		showMeta?: boolean;
		class?: string;
		onclick?: () => void;
	}
	
	let {
		avatar,
		username,
		subtitle,
		verified = false,
		rating_average,
		rating_count,
		hasStory = false,
		storyViewed = false,
		size = 'md',
		showMeta = true,
		class: className = '',
		onclick
	}: Props = $props();
	
	const avatarSizes = {
		sm: 'sm',
		md: 'md',
		lg: 'lg'
	} as const;
	
	const textSizes = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};
</script>

<button 
	class="user-badge {className}"
	onclick={onclick}
	type="button"
>
	<div class="avatar-wrapper">
		<StoryRing hasStory={hasStory} isViewed={storyViewed} size={avatarSizes[size]}>
			<img src={avatar} alt={username} loading="lazy" />
		</StoryRing>
	</div>
	
	{#if showMeta}
		<div class="user-info">
			<div class="username-row">
				<span class="username {textSizes[size]}">{username}</span>
				{#if verified}
					<span class="verified-badge" aria-label="Verified">
						<Check size={12} strokeWidth={3} />
					</span>
				{/if}
			</div>
			
			{#if subtitle || rating_average || username === 'w3bsuki'}
				<div class="user-meta">
					{#if subtitle}
						<span class="subtitle">{subtitle}</span>
					{:else if username === 'w3bsuki'}
						<span class="admin-badge">ADMIN</span>
					{:else if rating_average && rating_count}
						<div class="rating">
							<Star size={12} fill="currentColor" />
							<span>{rating_average.toFixed(1)} ({rating_count})</span>
						</div>
					{:else if rating_average}
						<div class="rating">
							<Star size={12} fill="currentColor" />
							<span>{rating_average.toFixed(1)} (1)</span>
						</div>
					{:else}
						<span class="subtitle">New seller</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</button>

<style>
	.user-badge {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-align: left;
		transition: opacity 0.2s ease;
	}
	
	.user-badge:hover {
		opacity: 0.8;
	}
	
	.avatar-wrapper {
		flex-shrink: 0;
	}
	
	.user-info {
		flex: 1;
		min-width: 0;
	}
	
	.username-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.username {
		font-weight: 600;
		color: var(--color-gray-900);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.verified-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		background: var(--color-brand);
		color: white;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.user-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.125rem;
		font-size: 0.75rem;
	}
	
	.subtitle {
		color: var(--color-gray-500);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.rating {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		color: var(--color-warning);
		font-weight: 600;
		flex-shrink: 0;
	}
	
	.admin-badge {
		background: linear-gradient(135deg, #dc2626, #991b1b);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.4px;
		flex-shrink: 0;
	}
</style>