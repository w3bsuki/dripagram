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
	/* Seller Info */
	.seller-info {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--font-size-xs);
	}
	
	.seller-avatar {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid var(--color-border);
	}
	
	.seller-name {
		color: var(--color-muted-foreground);
		font-weight: 500;
	}
	
	.seller-verified {
		background: #000;
		color: white;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-2xs);
		font-weight: bold;
	}
</style>