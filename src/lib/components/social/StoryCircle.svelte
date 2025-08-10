<!--
StoryCircle - Instagram-style story circle component
Displays story/highlight thumbnails with gradient ring for unviewed stories
Can be used for user stories, brand highlights, category collections, etc.
-->
<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		// Content
		id: string;
		title: string;
		subtitle?: string;
		imageUrl?: string;
		thumbnailUrl?: string;
		// State
		hasUnviewed?: boolean;
		isLive?: boolean;
		isActive?: boolean;
		// Customization
		size?: 'sm' | 'md' | 'lg' | 'xl';
		variant?: 'story' | 'highlight' | 'category' | 'collection';
		showLabel?: boolean;
		showBadge?: boolean;
		gradientColors?: [string, string]; // Custom gradient colors
		// Handlers
		onclick?: () => void;
	}

	let {
		id,
		title,
		subtitle,
		imageUrl,
		thumbnailUrl,
		hasUnviewed = false,
		isLive = false,
		isActive = false,
		size = 'md',
		variant = 'story',
		showLabel = true,
		showBadge = true,
		gradientColors,
		onclick
	}: Props = $props();

	// Size mappings
	const sizeClasses = {
		sm: 'w-12 h-12',
		md: 'w-16 h-16', 
		lg: 'w-20 h-20',
		xl: 'w-24 h-24'
	};

	const avatarSizes = {
		sm: 'sm',
		md: 'default', 
		lg: 'lg',
		xl: 'xl'
	} as const;

	// Default gradient colors based on variant using design tokens
	const defaultGradients = {
		story: ['var(--color-instagram-gradient-1)', 'var(--color-instagram-gradient-2)', 'var(--color-instagram-gradient-3)', 'var(--color-instagram-gradient-4)', 'var(--color-instagram-gradient-5)'],
		highlight: ['var(--color-story-highlight-1)', 'var(--color-story-highlight-2)', 'var(--color-story-highlight-3)', 'var(--color-story-highlight-4)', 'var(--color-brand-instagram)'],
		category: ['var(--color-brand-gradient-start)', 'var(--color-brand-gradient-end)'],
		collection: ['var(--color-accent-pink)', 'var(--color-like)']
	};

	let gradient = $derived(() => {
		if (gradientColors) {
			return `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`;
		}
		const colors = defaultGradients[variant];
		if (colors.length === 2) {
			return `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`;
		}
		return `linear-gradient(45deg, ${colors.join(', ')})`;
	});

	// Handle click
	function handleClick() {
		if (onclick) {
			onclick();
		}
	}

	// Generate initials for fallback
	let initials = $derived(() => {
		return title
			.split(' ')
			.map(word => word[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	});
</script>

<div class="story-circle-container">
	<button
		class="story-circle {size} {variant}"
		class:has-unviewed={hasUnviewed}
		class:is-active={isActive}
		class:is-live={isLive}
		onclick={handleClick}
		aria-label="View {variant}: {title}"
		disabled={!onclick}
	>
		<!-- Gradient Ring -->
		<div class="gradient-ring" style="background: {gradient}; padding: 0.5px;" class:!p-[1px]={hasUnviewed}>
			<div class="inner-ring" style="padding: 0px; margin: 0px;">
				{#if thumbnailUrl || imageUrl}
					<img 
						src={thumbnailUrl || imageUrl} 
						alt={title}
						class="w-full h-full rounded-full object-cover"
						loading="lazy"
						style="margin: 0; padding: 0; border: none;"
					/>
				{:else}
					<div class="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold" style="margin: 0; padding: 0;">
						{variant === 'category' ? '📂' : initials}
					</div>
				{/if}
			</div>
		</div>

		<!-- Live indicator -->
		{#if isLive && showBadge}
			<div class="live-indicator">
				<Badge variant="destructive" class="live-badge">LIVE</Badge>
			</div>
		{/if}

		<!-- Plus icon for add story -->
		{#if variant === 'story' && id === 'add-story'}
			<div class="add-icon">
				<div class="plus-circle">+</div>
			</div>
		{/if}
	</button>

	<!-- Label -->
	{#if showLabel}
		<div class="story-label">
			<div class="story-title">{title}</div>
			{#if subtitle}
				<div class="story-subtitle">{subtitle}</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.story-circle-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.story-circle {
		position: relative;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.story-circle:hover {
		transform: scale(1.05);
	}

	.story-circle:disabled {
		cursor: default;
	}

	.story-circle:disabled:hover {
		transform: none;
	}

	.story-circle.sm {
		width: 3rem;
		height: 3rem;
	}

	.story-circle.md {
		width: 4rem;
		height: 4rem;
	}

	.story-circle.lg {
		width: 5rem;
		height: 5rem;
	}

	.story-circle.xl {
		width: 6rem;
		height: 6rem;
	}

	/* Gradient ring */
	.gradient-ring {
		width: 100%;
		height: 100%;
		border-radius: 9999px;
		transition: all 0.2s ease;
	}

	.story-circle:not(.has-unviewed) .gradient-ring {
		background: var(--color-border-primary);
	}

	.inner-ring {
		width: 100%;
		height: 100%;
		background: white;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.story-avatar) {
		width: 100%;
		height: 100%;
	}

	:global(.story-fallback) {
		font-size: 0.75rem;
		font-weight: 700;
	}

	/* Active state */
	.story-circle.is-active .gradient-ring {
		box-shadow: 0 0 0 2px var(--color-brand-blue), 0 0 0 4px white;
	}

	/* Live indicator */
	.live-indicator {
		position: absolute;
		bottom: -0.25rem;
		left: 50%;
		transform: translateX(-50%);
	}

	:global(.live-badge) {
		font-size: 0.75rem;
		padding: 0.125rem 0.25rem;
		font-weight: 700;
	}

	/* Add story icon */
	.add-icon {
		position: absolute;
		bottom: -0.25rem;
		right: -0.25rem;
	}

	.plus-circle {
		width: 1.25rem;
		height: 1.25rem;
		background: #1DA1F2; /* Perfect blue color */
		border: 1px solid #1DA1F2; /* Tiny perfect blue border */
		color: white;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		font-weight: 700;
	}

	/* Labels */
	.story-label {
		text-align: center;
		max-width: 4rem;
	}

	@media (min-width: 1024px) {
		.story-label {
			max-width: 5rem;
		}
	}

	.story-title {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.story-subtitle {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 0.125rem;
	}

	/* Variant-specific styles */
	.story-circle.highlight .gradient-ring {
		padding: 0.125rem;
	}

	.story-circle.category :global(.story-avatar) {
		border: 1px solid var(--color-border-primary);
	}

	.story-circle.collection:hover {
		transform: scale(1.1);
	}



	/* Hover effects */
	.story-circle:hover .gradient-ring {
		filter: brightness(1.1);
	}

	/* Focus styles */
	.story-circle:focus-visible {
		outline: 2px solid var(--color-interactive-primary);
		outline-offset: 2px;
	}
</style>