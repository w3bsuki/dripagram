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
		<span class="seller-name">
			{seller.username || seller.full_name || 'Anonymous'}
		</span>
		{#if seller.verified || seller.seller_verified}
			<span class="seller-verified">✓</span>
		{/if}
	</div>
{/if}

<style>
	/* Seller Info - Subtle and clean */
	.seller-info {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 0.75rem; /* 12px */
	}
	
	.seller-avatar {
		width: 18px; /* Slightly smaller */
		height: 18px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid oklch(0.92 0 0);
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
	}
</style>