<script lang="ts">
	type User = {
		id: string;
		title: string;
		subtitle: string;
		imageUrl: string;
		isVerified: boolean;
		followerCount: number;
		productCount: number;
	};

	let { 
		users,
		onUserClick
	}: {
		users: User[];
		onUserClick: (user: User) => void;
	} = $props();
</script>

<!-- Registered Users Bar (NOT sticky, just scrollable) -->
<div class="brands-bar">
	<div class="brands-container">
		{#each users as user (user.id)}
			<button 
				class="brand-circle"
				onclick={() => onUserClick(user)}
				aria-label="View {user.title} profile"
			>
				<div class="brand-image-wrapper">
					<img 
						src={user.imageUrl} 
						alt={user.title}
						loading="lazy"
					/>
					{#if user.isVerified}
						<div class="verified-badge">
							<svg width="10" height="8" viewBox="0 0 10 8" fill="white">
								<path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.5" fill="none"/>
							</svg>
						</div>
					{/if}
				</div>
				<span class="brand-name">{user.title}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	/* Verified Brands Bar */
	.brands-bar {
		background: white;
		border-bottom: 1px solid var(--color-border-light);
		padding: 1rem 0;
		overflow: hidden; /* Prevent any overflow */
		touch-action: pan-x; /* Only horizontal touch */
		position: relative;
		z-index: var(--z-medium); /* Below feed-tabs but visible */
	}

	.brands-container {
		display: flex;
		gap: 16px;
		overflow-x: auto;
		overflow-y: hidden; /* Prevent vertical scroll */
		padding: 0 16px;
		scroll-behavior: smooth;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-snap-type: x mandatory;
		scroll-padding: 0 16px;
		touch-action: pan-x; /* Only allow horizontal panning */
		user-select: none; /* Prevent text selection */
		-webkit-user-select: none;
	}

	.brands-container::-webkit-scrollbar {
		display: none;
	}

	.brand-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
		transition: transform 0.2s;
		scroll-snap-align: start;
		/* (100vw - 32px padding - 64px gaps) / 5 = each circle width */
		width: calc((100vw - 32px - 64px) / 5);
		max-width: 72px; /* Cap size on larger screens */
	}

	.brand-circle:hover {
		transform: scale(1.05);
	}

	.brand-image-wrapper {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		max-width: 64px;
		border-radius: 50%;
		border: 2px solid var(--color-border-light);
		background: white;
		overflow: visible;
	}

	.brand-image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		overflow: hidden;
	}

	.verified-badge {
		position: absolute;
		bottom: -2px;
		right: -2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid white;
		background: var(--color-surface-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.verified-badge svg {
		width: 12px;
		height: 12px;
	}

	.brand-name {
		font-size: 0.7rem;
		color: var(--color-text-quaternary);
		font-weight: 500;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 100%;
	}
</style>