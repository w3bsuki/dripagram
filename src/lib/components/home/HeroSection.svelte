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
<section class="bg-gray-50 border-b {className || ''}">
	<div class="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
		<div class="text-center max-w-4xl mx-auto">
			<!-- Badge -->
			<div class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
				<span class="animate-pulse">🎉</span> 
				Нови 1000+ продукта всеки ден
			</div>
			
			<!-- Main Heading -->
			<h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
				Открий своя стил
			</h1>
			
			<p class="text-lg md:text-xl text-gray-600 mb-8 md:mb-10">
				Присъедини се към най-голямата модна общност в България 🌿
			</p>
			
			<!-- Enhanced Search Bar -->
			<div class="relative max-w-2xl mx-auto mb-6 md:mb-8">
				<div class="group flex items-center bg-white rounded-full shadow-md border border-gray-200 overflow-hidden hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/50 transition-all duration-300">
					<Search class="absolute left-5 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
					<input
						type="text"
						bind:value={searchValue}
						onkeydown={(e) => e.key === 'Enter' && handleSearch()}
						placeholder="Търси Supreme, Zara, vintage..."
						class="w-full pl-14 pr-4 py-3 md:py-4 text-base bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
					/>
					<Button 
						onclick={handleSearch}
						class="bg-blue-600 text-white hover:bg-blue-700 px-6 md:px-8 py-3 md:py-4 m-1 rounded-full font-semibold transition-colors duration-300 flex-shrink-0"
					>
						Търси
					</Button>
				</div>
				
				<!-- Trending Searches -->
				<div class="flex items-center justify-center gap-2 mt-4 flex-wrap">
					<span class="text-sm text-gray-500 hidden md:block">Популярни:</span>
					{#each trendingSearches as trend}
						<button 
							onclick={() => handleTrendingClick(trend)}
							class="text-sm bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 px-3 py-1.5 rounded-full transition-all duration-200"
						>
							{trend}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Trust Badges -->
			<div class="flex items-center justify-center gap-4 md:gap-8 text-sm text-gray-600 flex-wrap">
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
					</svg>
					<span class="text-xs md:text-sm">Верифицирани продавачи</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
						<path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
						<path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
					</svg>
					<span class="text-xs md:text-sm">Безплатна доставка</span>
				</div>
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
					</svg>
					<span class="text-xs md:text-sm">100K+ доволни клиенти</span>
				</div>
			</div>
		</div>
	</div>
</section>
