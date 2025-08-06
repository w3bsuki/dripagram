<script lang="ts">
	import { MoreHorizontal } from '@lucide/svelte';

	interface Seller {
		id: string;
		username?: string;
		full_name?: string;
		avatar_url?: string;
		verified?: boolean;
		seller_verified?: boolean;
		follower_count?: number;
	}

	interface Props {
		seller: Seller;
		variant?: 'grid' | 'feed' | 'compact';
		showMoreOptions?: boolean;
	}

	let { seller, variant = 'grid', showMoreOptions = false }: Props = $props();

	// Get the seller display name
	let sellerName = $derived(seller.username || seller.full_name || 'Anonymous');
</script>

{#if variant === 'feed'}
	<!-- Feed Style Header -->
	<header class="border-primary flex items-center justify-between border-b px-4 py-3">
		<a href="/profile/{seller.username}" class="group flex items-center gap-3">
			<div class="instagram-story-ring">
				<img
					src={seller.avatar_url || `https://ui-avatars.com/api/?name=${sellerName}`}
					alt={sellerName}
					class="bg-surface-primary h-8 w-8 rounded-full object-cover"
					loading="lazy"
				/>
			</div>
			<div class="flex-1">
				<div class="flex items-center gap-1.5">
					<span class="text-primary group-hover:text-brand text-sm font-semibold transition-colors"
						>{sellerName}</span
					>
					{#if seller.verified || seller.seller_verified}
						<div class="verified-badge-instagram">
							<svg viewBox="0 0 24 24" fill="currentColor" class="h-2 w-2">
								<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
							</svg>
						</div>
					{/if}
				</div>
				{#if seller.follower_count}
					<div class="text-secondary text-xs">
						{seller.follower_count.toLocaleString()} followers
					</div>
				{/if}
			</div>
		</a>
		{#if showMoreOptions}
			<button class="action-btn-instagram" aria-label="More options">
				<MoreHorizontal size={20} class="text-secondary" />
			</button>
		{/if}
	</header>
{:else}
	<!-- Grid Style Seller Info -->
	<div class="mb-3 flex items-center gap-2.5">
		<img
			src={seller.avatar_url || `https://ui-avatars.com/api/?name=${sellerName}`}
			alt={sellerName}
			class="border-primary h-7 w-7 rounded-full border object-cover"
			loading="lazy"
		/>
		<div class="flex min-w-0 flex-1 items-center gap-1.5">
			<span class="text-secondary truncate text-sm font-medium">{sellerName}</span>
			{#if seller.verified || seller.seller_verified}
				<div class="verified-badge-instagram flex-shrink-0">
					<svg viewBox="0 0 24 24" fill="currentColor" class="h-2 w-2">
						<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
					</svg>
				</div>
			{/if}
		</div>
	</div>
{/if}
