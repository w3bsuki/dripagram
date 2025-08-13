<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/components/native/Button.svelte';
	import { Check, Home, Package, Share2 } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	
	// Get product ID from query params
	let productId = $derived($page.url.searchParams.get('id'));
	let productTitle = $derived($page.url.searchParams.get('title'));
	let countdown = $state(5);
	
	// Get current language
	const lang = getLocale();
	
	// Auto-redirect after 5 seconds
	onMount(() => {
		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				goto(`/${lang}`);
			}
		}, 1000);
		
		return () => clearInterval(timer);
	});
	
	function shareProduct() {
		if ('share' in navigator && productId) {
			navigator.share({
				title: productTitle || 'Check out my listing',
				text: 'I just listed this item on Driplo!',
				url: `${window.location.origin}/${lang}/products/${productId}`
			});
		}
	}
</script>

<div class="success-container">
	<div class="success-content">
		<!-- Success Icon -->
		<div class="success-icon-wrapper">
			<div class="success-icon">
				<div class="icon-circle">
					<Check size={48} />
				</div>
				<!-- Animated pulse ring -->
				<div class="pulse-ring"></div>
			</div>
		</div>
		
		<!-- Success Message -->
		<h1 class="success-title">
			{m['sell_success.title']()}
		</h1>
		
		<p class="success-subtitle">
			{m['sell_success.subtitle']()}
			{#if productTitle}
				<span class="product-title">"{productTitle}"</span>
			{/if}
		</p>
		
		<!-- Quick Stats -->
		<div class="stats-card">
			<div class="stats-grid">
				<div class="stat-item">
					<p class="stat-label">{m['sell_success.status']()}</p>
					<p class="stat-value active">{m['sell_success.active']()}</p>
				</div>
				<div class="stat-item">
					<p class="stat-label">{m['sell_success.visibility']()}</p>
					<p class="stat-value">{m['sell_success.public']()}</p>
				</div>
				<div class="stat-item">
					<p class="stat-label">{m['sell_success.views']()}</p>
					<p class="stat-value">0</p>
				</div>
			</div>
		</div>
		
		<!-- Action Buttons -->
		<div class="action-buttons">
			{#if productId}
				<button
					onclick={() => goto(`/${lang}/products/${productId}`)}
					class="btn btn-primary"
				>
					<Package size={18} />
					{m['sell_success.view_listing']()}
				</button>
			{/if}
			
			<button
				onclick={() => goto(`/${lang}/sell`)}
				class="btn btn-secondary"
			>
				{m['sell_success.list_another']()}
			</button>
			
			{#if productId && 'share' in navigator}
				<button
					onclick={shareProduct}
					class="btn btn-secondary"
				>
					<Share2 size={18} />
					{m['sell_success.share_listing']()}
				</button>
			{/if}
		</div>
		
		<!-- Auto-redirect notice -->
		<div class="redirect-notice">
			<p>{m['sell_success.redirecting']({ countdown })}</p>
			<button
				onclick={() => goto(`/${lang}`)}
				class="link-button"
			>
				{m['sell_success.go_home_now']()}
			</button>
		</div>
		
		<!-- Tips -->
		<div class="tips-card">
			<p class="tips-title">{m['sell_success.pro_tips']()}</p>
			<ul class="tips-list">
				<li>{m['sell_success.tip_1']()}</li>
				<li>{m['sell_success.tip_2']()}</li>
				<li>{m['sell_success.tip_3']()}</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.success-container {
		min-height: 100vh;
		background: linear-gradient(to bottom, #f0fdf4, white);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px 16px;
		font-family: var(--font-family-primary);
	}

	.success-content {
		max-width: 420px;
		width: 100%;
		text-align: center;
	}

	/* Success Icon */
	.success-icon-wrapper {
		margin-bottom: 24px;
		display: inline-flex;
	}

	.success-icon {
		position: relative;
	}

	.icon-circle {
		width: 96px;
		height: 96px;
		border-radius: 50%;
		background: linear-gradient(135deg, #10b981, #059669);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
	}

	.pulse-ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: #10b981;
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		opacity: 0.2;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 0.2;
			transform: scale(1);
		}
		50% {
			opacity: 0;
			transform: scale(1.5);
		}
	}

	/* Typography */
	.success-title {
		font-size: 28px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 12px 0;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.success-subtitle {
		font-size: 15px;
		color: var(--color-text-secondary);
		margin: 0 0 24px 0;
		line-height: 1.5;
	}

	.product-title {
		display: block;
		margin-top: 8px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	/* Stats Card */
	.stats-card {
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		border: 1px solid var(--color-border-primary);
		padding: 20px;
		margin-bottom: 24px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}

	.stat-item {
		text-align: center;
	}

	.stat-label {
		font-size: 12px;
		color: var(--color-text-secondary);
		margin: 0 0 4px 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.stat-value {
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.stat-value.active {
		color: #10b981;
	}

	/* Action Buttons */
	.action-buttons {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}

	.btn {
		height: 48px;
		padding: 0 20px;
		border-radius: 8px;
		font-size: 15px;
		font-weight: 500;
		font-family: var(--font-family-primary);
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		width: 100%;
	}

	.btn-primary {
		background: var(--color-interactive-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-interactive-primary-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}

	.btn-primary:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-secondary {
		background: white;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-primary);
	}

	.btn-secondary:hover {
		background: var(--color-surface-secondary);
		border-color: var(--color-border-secondary);
	}

	.btn-secondary:focus-visible {
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
	}

	.btn-secondary:active {
		transform: scale(0.98);
	}

	/* Redirect Notice */
	.redirect-notice {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin-bottom: 24px;
	}

	.redirect-notice p {
		margin: 0 0 4px 0;
	}

	.link-button {
		background: none;
		border: none;
		color: var(--color-interactive-primary);
		font-size: 14px;
		font-weight: 500;
		font-family: var(--font-family-primary);
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s ease;
		padding: 4px;
		outline: none;
	}

	.link-button:hover {
		text-decoration: underline;
	}

	.link-button:focus-visible {
		box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
		border-radius: 4px;
	}

	/* Tips Card */
	.tips-card {
		background: linear-gradient(135deg, #eff6ff, #dbeafe);
		border-radius: 12px;
		padding: 16px;
		text-align: left;
		border: 1px solid #bfdbfe;
	}

	.tips-title {
		font-size: 14px;
		font-weight: 600;
		color: #1e40af;
		margin: 0 0 8px 0;
	}

	.tips-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tips-list li {
		font-size: 13px;
		color: #1e3a8a;
		line-height: 1.5;
		padding: 4px 0;
		position: relative;
		padding-left: 16px;
	}

	.tips-list li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: #3b82f6;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.success-container {
			padding: 16px 12px;
		}

		.icon-circle {
			width: 80px;
			height: 80px;
		}

		.success-title {
			font-size: 24px;
		}

		.btn {
			height: 44px;
			font-size: 14px;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.pulse-ring {
			animation: none;
			opacity: 0.1;
		}
	}
</style>