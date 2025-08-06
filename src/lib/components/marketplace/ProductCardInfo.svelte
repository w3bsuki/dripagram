<script lang="ts">
	import { Heart } from '@lucide/svelte';

	interface Props {
		title: string;
		size?: string;
		tags?: string[];
		likesCount: number;
		createdAt?: string;
		variant?: 'grid' | 'feed' | 'compact';
		showTimestamp?: boolean;
	}

	let {
		title,
		size,
		tags,
		likesCount,
		createdAt,
		variant = 'grid',
		showTimestamp = false,
	}: Props = $props();

	function formatTimeAgo(dateString: string) {
		const now = new Date();
		const date = new Date(dateString);
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return 'now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
		if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
		if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
		return `${Math.floor(diffInSeconds / 604800)}w`;
	}
</script>

{#if variant === 'feed'}
	<!-- Feed Style Content Section -->
	<div class="px-4 pb-2">
		<!-- Caption -->
		<div class="text-instagram-primary text-sm leading-relaxed">
			<span>{title}</span>
		</div>

		<!-- Tags -->
		{#if tags && tags.length > 0}
			<div class="mt-2 flex flex-wrap gap-2">
				{#each tags.slice(0, 3) as tag}
					<a
						href="/search?tag={tag}"
						class="text-instagram-blue hover:text-instagram-blue-hover text-sm font-medium transition-colors"
					>
						#{tag}
					</a>
				{/each}
				{#if tags.length > 3}
					<span class="text-instagram-secondary text-sm">+{tags.length - 3} more</span>
				{/if}
			</div>
		{/if}

		<!-- Timestamp -->
		{#if showTimestamp && createdAt}
			<time class="text-instagram-secondary mt-3 block text-xs font-medium tracking-wide uppercase">
				{formatTimeAgo(createdAt)}
			</time>
		{/if}
	</div>
{:else}
	<!-- Grid Style Content -->
	<div class="p-4">
		<!-- Title -->
		<h3
			class="text-instagram-primary group-hover:text-instagram-blue mb-2 line-clamp-2 text-base leading-snug font-semibold transition-colors"
		>
			{title}
		</h3>

		<!-- Stats and Size -->
		<div class="flex items-center justify-between text-xs">
			<div class="text-instagram-secondary flex items-center gap-3">
				<span class="flex items-center gap-1">
					<Heart size={12} />
					{likesCount}
				</span>
				{#if size}
					<span class="bg-instagram-gray-200 rounded-full px-2 py-0.5 font-medium">
						Size {size}
					</span>
				{/if}
			</div>
			{#if showTimestamp && createdAt}
				<time class="text-instagram-secondary font-medium">
					{formatTimeAgo(createdAt)}
				</time>
			{/if}
		</div>
	</div>
{/if}
