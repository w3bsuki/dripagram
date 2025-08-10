<script lang="ts">
	interface Props {
		seller: any;
	}

	let { seller }: Props = $props();
</script>

<!-- Seller Info -->
{#if seller}
	<div class="seller-info">
		<img 
			src={seller.avatar_url || seller.avatar || '/default-avatar.svg'} 
			alt={seller.username || 'Seller'}
			class="seller-avatar"
		/>
		<div class="seller-meta">
			<span class="seller-name">
				{seller.username || seller.full_name || 'Anonymous'}
			</span>
			{#if seller.verified || seller.seller_verified}
				<span class="seller-verified">✓</span>
			{/if}
		</div>
		
		<!-- Rating -->
		<div class="seller-rating">
			{#if seller.username === 'w3bsuki'}
				<span class="admin-badge">ADMIN</span>
			{:else if seller.rating_average && seller.rating_count}
				<span class="rating">⭐ {seller.rating_average.toFixed(1)} ({seller.rating_count})</span>
			{:else if seller.rating_average}
				<span class="rating">⭐ {seller.rating_average.toFixed(1)} (1)</span>
			{:else}
				<span class="new-seller">New seller</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* Seller Info - Subtle and clean */
	.seller-info {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem; /* 12px */
	}
	
	.seller-avatar {
		width: 18px; /* Slightly smaller */
		height: 18px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid oklch(0.92 0 0);
		flex-shrink: 0;
	}
	
	.seller-meta {
		display: flex;
		align-items: center;
		gap: 4px;
	}
	
	.seller-name {
		color: oklch(0.55 0 0); /* Medium gray */
		font-weight: 400; /* Regular weight */
		letter-spacing: 0.01em;
	}
	
	.seller-verified {
		background: oklch(0.55 0.25 260); /* Blue check */
		color: white;
		width: 12px; /* Smaller */
		height: 12px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.5rem; /* 8px */
		font-weight: bold;
		flex-shrink: 0;
	}
	
	.seller-rating {
		margin-left: auto;
		font-size: 0.6875rem; /* 11px */
	}
	
	.rating {
		color: oklch(0.45 0 0);
		font-weight: 500;
	}
	
	.new-seller {
		color: oklch(0.65 0 0);
		font-style: italic;
	}
	
	.admin-badge {
		background: linear-gradient(135deg, #dc2626, #991b1b);
		color: white;
		padding: 1px 4px;
		border-radius: 3px;
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}
</style>