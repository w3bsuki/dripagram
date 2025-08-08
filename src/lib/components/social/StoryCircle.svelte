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

	// Default gradient colors based on variant
	const defaultGradients = {
		story: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'],
		highlight: ['#405de6', '#5b51d8', '#833ab4', '#c13584', '#e1306c'],
		category: ['#667eea', '#764ba2'],
		collection: ['#f093fb', '#f5576c']
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
		<div class="gradient-ring" style="background: {gradient}">
			<div class="inner-ring">
				<Avatar size={avatarSizes[size]} class="story-avatar">
					<AvatarImage 
						src={thumbnailUrl || imageUrl} 
						alt={title}
						loading="lazy"
					/>
					<AvatarFallback class="story-fallback">
						{variant === 'category' ? '📂' : initials}
					</AvatarFallback>
				</Avatar>
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
		padding: 0.125rem;
		transition: all 0.2s ease;
	}

	.story-circle.has-unviewed .gradient-ring {
		padding: 0.25rem;
	}

	.story-circle:not(.has-unviewed) .gradient-ring {
		background: #e5e7eb;
		padding: 0.125rem;
	}

	.inner-ring {
		width: 100%;
		height: 100%;
		background: white;
		border-radius: 9999px;
		padding: 0.125rem;
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
		box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px white;
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
		background: #3b82f6;
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
		color: #0f172a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.story-subtitle {
		font-size: 0.75rem;
		color: #6b7280;
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
		border: 1px solid #e5e7eb;
	}

	.story-circle.collection:hover {
		transform: scale(1.1);
	}

	/* Size-specific adjustments */
	.story-circle.sm .story-label {
		max-width: 3rem;
	}

	.story-circle.sm .story-title,
	.story-circle.sm .story-subtitle {
		font-size: 0.75rem;
	}

	.story-circle.lg .story-label {
		max-width: 6rem;
	}

	.story-circle.xl .story-label {
		max-width: 7rem;
	}

	.story-circle.lg .story-title,
	.story-circle.xl .story-title {
		font-size: 0.875rem;
	}

	/* Hover effects */
	.story-circle:hover .gradient-ring {
		filter: brightness(1.1);
	}

	/* Focus styles */
	.story-circle:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>