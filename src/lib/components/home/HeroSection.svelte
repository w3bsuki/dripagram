<script lang="ts">
	import { Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';

	type Props = {
		searchQuery?: string;
		onSearchSubmit?: (query: string) => void;
		className?: string;
	};

	let { searchQuery = '', onSearchSubmit, className }: Props = $props();

	let searchValue = $state(searchQuery);

	const trendingSearches = ['Nike Air', 'Vintage рокли', 'Zara', 'Y2K', 'Supreme'];

	function handleSearch() {
		if (searchValue.trim()) {
			onSearchSubmit?.(searchValue);
			goto(`/browse?q=${encodeURIComponent(searchValue)}`);
		}
	}

	function handleTrendingClick(trend: string) {
		searchValue = trend;
		handleSearch();
	}
</script>

<!-- Modern Hero Section with Improved Search -->
<section class="bg-surface-secondary border-primary border-b {className || ''}">
	<div class="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
		<div class="mx-auto max-w-4xl text-center">
			<!-- Badge -->
			<div
				class="bg-surface-brand-subtle text-brand mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
			>
				<span class="animate-pulse">🎉</span>
				Нови 1000+ продукта всеки ден
			</div>

			<!-- Main Heading -->
			<h1 class="text-primary mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
				Открий своя стил
			</h1>

			<p class="text-secondary mb-8 text-lg md:mb-10 md:text-xl">
				Присъедини се към най-голямата модна общност в България 🌿
			</p>

			<!-- Enhanced Search Bar -->
			<div class="relative mx-auto mb-6 max-w-2xl md:mb-8">
				<div
					class="group bg-surface-primary border-primary flex items-center overflow-hidden rounded-full border shadow-md transition-all duration-300 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/50 hover:shadow-lg"
				>
					<Search
						class="text-secondary group-focus-within:text-brand absolute left-5 h-5 w-5 transition-colors"
					/>
					<input
						type="text"
						bind:value={searchValue}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						placeholder="Търси Supreme, Zara, vintage..."
						class="text-primary placeholder-secondary w-full bg-transparent py-3 pr-4 pl-14 text-base focus:outline-none md:py-4"
					/>
					<Button
						onclick={handleSearch}
						class="btn-primary m-1 flex-shrink-0 rounded-full px-6 py-3 font-semibold transition-colors duration-300 md:px-8 md:py-4"
					>
						Търси
					</Button>
				</div>

				<!-- Trending Searches -->
				<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
					<span class="text-secondary hidden text-sm md:block">Популярни:</span>
					{#each trendingSearches as trend}
						<button
							onclick={() => handleTrendingClick(trend)}
							class="bg-surface-secondary text-primary hover:bg-surface-brand-subtle hover:text-brand rounded-full px-3 py-1.5 text-sm transition-all duration-200"
						>
							{trend}
						</button>
					{/each}
				</div>
			</div>

			<!-- Trust Badges -->
			<div class="text-secondary flex flex-wrap items-center justify-center gap-4 text-sm md:gap-8">
				<div class="flex items-center gap-2">
					<svg class="text-success h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-xs md:text-sm">Верифицирани продавачи</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="text-brand h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
						<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
					</svg>
					<span class="text-xs md:text-sm">Безплатна доставка</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="text-secondary h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="text-xs md:text-sm">100K+ доволни клиенти</span>
				</div>
			</div>
		</div>
	</div>
</section>
