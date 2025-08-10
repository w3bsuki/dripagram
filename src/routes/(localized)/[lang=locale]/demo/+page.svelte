<script lang="ts">
	import { getLocaleContext } from '$lib/stores/locale.svelte';
	import { LocaleSwitcher } from '$lib/components/ui/locale-switcher';
	import { RegionSelector } from '$lib/components/ui/region-selector';

	// Get locale context
	const localeManager = getLocaleContext();

	// Demo state
	let selectedRegion = $state(localeManager.region);

	// Handle region change with effect
	$effect(() => {
		if (selectedRegion !== localeManager.region) {
			localeManager.setRegion(selectedRegion);
		}
	});

	// Demo data for different locales
	const demoContent = {
		bg: {
			title: 'Демо на Локализационната Система',
			subtitle: 'Тест на българо-първата локализация с Svelte 5',
			description: 'Тази демо страница показва как работи нашата локализационна система със Svelte 5 $state() рунове.',
			features: [
				'🇧🇬 Българска локализация по подразбиране',
				'🔄 Реактивно превключване на езика',
				'🍪 Запазване в бисквитки и Supabase',
				'🏛️ Избор на регион (София, Пловдив, и др.)',
				'⚡ Мгновено превключване без презареждане',
				'♿ Пълна достъпност и клавиатурна навигация'
			],
			currentSettings: 'Текущи настройки:',
			language: 'Език:',
			region: 'Регион:',
			loading: 'Зареждане...',
			error: 'Грешка:',
			regionLabel: 'Избери регион:',
			regionDesc: 'Изберете вашия регион за по-добро локално съдържание.'
		},
		en: {
			title: 'Localization System Demo',
			subtitle: 'Testing Bulgarian-first localization with Svelte 5',
			description: 'This demo page showcases how our localization system works with Svelte 5 $state() runes.',
			features: [
				'🇧🇬 Bulgarian localization by default',
				'🔄 Reactive language switching',
				'🍪 Cookie and Supabase persistence',
				'🌍 Region selection (International, Europe, etc.)',
				'⚡ Instant switching without reload',
				'♿ Full accessibility and keyboard navigation'
			],
			currentSettings: 'Current settings:',
			language: 'Language:',
			region: 'Region:',
			loading: 'Loading...',
			error: 'Error:',
			regionLabel: 'Select region:',
			regionDesc: 'Choose your region for better localized content.'
		}
	};

	// Get current content based on locale
	const content = $derived(demoContent[localeManager.locale]);
</script>

<svelte:head>
	<title>{content.title} - Driplo</title>
	<meta name="description" content={content.description} />
</svelte:head>

<div class="demo-page">
	<div class="demo-container">
		<!-- Header -->
		<header class="demo-header">
			<h1 class="demo-title">{content.title}</h1>
			<p class="demo-subtitle">{content.subtitle}</p>
			<p class="demo-description">{content.description}</p>
		</header>

		<!-- Locale Switcher Demo -->
		<section class="demo-section">
			<h2 class="section-title">Language Switcher</h2>
			<div class="switcher-demo">
				<LocaleSwitcher />
				<LocaleSwitcher compact={true} />
			</div>
		</section>

		<!-- Current Settings Display -->
		<section class="demo-section">
			<h2 class="section-title">{content.currentSettings}</h2>
			<div class="settings-grid">
				<div class="setting-item">
					<div class="setting-label">{content.language}</div>
					<div class="setting-value">
						<span class="flag">{localeManager.localeFlag}</span>
						<span class="text">{localeManager.localeDisplayName}</span>
					</div>
				</div>
				
				<div class="setting-item">
					<div class="setting-label">{content.region}</div>
					<div class="setting-value">
						<span class="emoji">{localeManager.currentRegion?.emoji || '📍'}</span>
						<span class="text">{localeManager.currentRegion?.name || localeManager.region}</span>
					</div>
				</div>

				{#if localeManager.isLoading}
					<div class="setting-item">
						<div class="setting-label">Status:</div>
						<div class="setting-value">
							<div class="loading-indicator"></div>
							<span class="text">{content.loading}</span>
						</div>
					</div>
				{/if}

				{#if localeManager.error}
					<div class="setting-item error">
						<div class="setting-label">{content.error}</div>
						<div class="setting-value">
							<span class="text">{localeManager.error}</span>
							<button 
								class="clear-error-btn" 
								onclick={() => localeManager.clearError()}
							>
								Clear
							</button>
						</div>
					</div>
				{/if}
			</div>
		</section>

		<!-- Region Selector Demo -->
		<section class="demo-section">
			<h2 class="section-title">{content.regionLabel}</h2>
			<RegionSelector 
				bind:value={selectedRegion}
				label={content.regionLabel}
				description={content.regionDesc}
			/>
		</section>

		<!-- Features List -->
		<section class="demo-section">
			<h2 class="section-title">Features</h2>
			<ul class="features-list">
				{#each content.features as feature}
					<li class="feature-item">{feature}</li>
				{/each}
			</ul>
		</section>

		<!-- Live Reactive Demo -->
		<section class="demo-section">
			<h2 class="section-title">Live Reactive State</h2>
			<div class="reactive-demo">
				<code class="code-block">
					{JSON.stringify({
						locale: localeManager.locale,
						region: localeManager.region,
						isLoading: localeManager.isLoading,
						hasChanged: localeManager.hasChanged,
						availableRegions: localeManager.availableRegions.length
					}, null, 2)}
				</code>
			</div>
		</section>
	</div>
</div>

<style>
	.demo-page {
		min-height: 100vh;
		background: var(--color-background);
		padding: var(--header-height) 1rem 2rem;
	}

	.demo-container {
		max-width: 1000px;
		margin: 0 auto;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 3rem;
		padding: 2rem;
		background: var(--color-surface);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-border);
	}

	.demo-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.demo-subtitle {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		margin-bottom: 1rem;
	}

	.demo-description {
		font-size: 1rem;
		color: var(--color-text-secondary);
		line-height: 1.6;
		max-width: 600px;
		margin: 0 auto;
	}

	.demo-section {
		margin-bottom: 2rem;
		padding: 2rem;
		background: var(--color-surface);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-border);
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 1.5rem;
	}

	.switcher-demo {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		align-items: center;
	}

	.settings-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.setting-item {
		padding: 1rem;
		background: var(--color-background);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-border);
	}

	.setting-item.error {
		border-color: var(--color-danger);
		background: rgba(239, 68, 68, 0.05);
	}

	.setting-label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: 0.5rem;
	}

	.setting-value {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.flag, .emoji {
		font-size: 1.125rem;
	}

	.text {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.loading-indicator {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-radius: 50%;
		border-top-color: var(--color-primary);
		animation: spin 1s ease-in-out infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.clear-error-btn {
		padding: 0.25rem 0.5rem;
		font-size: var(--text-xs);
		background: var(--color-danger);
		color: white;
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.clear-error-btn:hover {
		opacity: 0.8;
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.feature-item {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--color-border);
		font-size: 1rem;
		color: var(--color-text-primary);
	}

	.feature-item:last-child {
		border-bottom: none;
	}

	.reactive-demo {
		background: var(--color-gray-900);
		border-radius: var(--border-radius-md);
		padding: 1rem;
	}

	.code-block {
		display: block;
		font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--color-green-400);
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.demo-page {
			padding: var(--header-height) 0.5rem 1rem;
		}

		.demo-title {
			font-size: 2rem;
		}

		.demo-subtitle {
			font-size: 1.125rem;
		}

		.demo-section {
			padding: 1.5rem;
		}

		.settings-grid {
			grid-template-columns: 1fr;
		}
	}
</style>