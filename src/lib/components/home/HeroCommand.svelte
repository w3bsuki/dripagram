<script lang="ts">
	import { Search, Camera, Zap, TrendingUp, MapPin, Star, Users } from '@lucide/svelte';
	// import * as Command from '$lib/components/ui/command'; // Temporarily disabled
	// import * as Popover from '$lib/components/ui/popover'; // Temporarily disabled due to compatibility issues
	
	let searchOpen = $state(false);
	let searchValue = $state('');
	let locationOpen = $state(false);
	let selectedLocation = $state('София');
	
	// Sample trending searches
	let trendingSearches = [
		'iPhone 15 Pro',
		'Nike Air Max',
		'Zara яке',
		'PlayStation 5',
		'Зимни обувки'
	];
	
	// Quick action categories
	let quickActions = [
		{
			icon: Camera,
			title: 'Снимай и продавай',
			description: 'Направи снимка с телефона си',
			color: 'bg-blue-50 text-blue-600',
			href: '/sell?type=photo'
		},
		{
			icon: Zap,
			title: 'Бързо обява',
			description: 'Готова за 2 минути',
			color: 'bg-green-50 text-green-600',
			href: '/sell?type=quick'
		},
		{
			icon: TrendingUp,
			title: 'Търсени продукти',
			description: 'Виж какво се търси',
			color: 'bg-purple-50 text-purple-600',
			href: '/trending'
		}
	];
	
	// Location suggestions
	let locations = [
		{ name: 'София', region: 'София-град' },
		{ name: 'Пловдив', region: 'Пловдивска област' },
		{ name: 'Варна', region: 'Варненска область' },
		{ name: 'Бургас', region: 'Бургаска област' },
		{ name: 'Русе', region: 'Русенска област' },
		{ name: 'Стара Загора', region: 'Старозагорска област' }
	];
	
	// Recent searches (mock data)
	let recentSearches = [
		'Зимно яке',
		'iPhone чехол',
		'Adidas маратонки'
	];
	
	function handleSearch(query: string) {
		searchValue = query;
		searchOpen = false;
		// TODO: Implement search navigation
		console.log('Searching for:', query);
	}
	
	function selectLocation(location: string) {
		selectedLocation = location;
		locationOpen = false;
	}
</script>

<section class="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-20">
	<div class="max-w-4xl mx-auto px-4 text-center">
		<!-- Hero Title -->
		<div class="mb-8">
			<h1 class="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
				Намери своя <span class="text-primary">перфектен</span> стил
			</h1>
			<p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
				Най-голямата платформа за втора употреба мода в България. 
				Над 50,000 продукта, 10,000+ доволни потребители.
			</p>
		</div>
		
		<!-- Advanced Search -->
		<div class="mb-8">
			<div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 max-w-2xl mx-auto">
				<!-- Search Input -->
				<div class="flex flex-col md:flex-row gap-4">
					<div class="flex-1">
						<button
							onclick={() => searchOpen = true}
							class="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-500 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-gray-100 transition-all"
						>
							<Search size={20} />
							<span class="flex-1">Търси продукти, марки, категории...</span>
						</button>
					</div>
					
					<!-- Location Selector -->
					<div class="relative">
						<button 
							onclick={() => locationOpen = !locationOpen}
							class="flex items-center gap-2 px-4 py-3 text-gray-700 bg-gray-50 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-gray-100 transition-all"
						>
							<MapPin size={16} />
							<span class="whitespace-nowrap">{selectedLocation}</span>
						</button>
						{#if locationOpen}
							<div class="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
								<div class="p-4 border-b border-gray-100">
									<h3 class="font-semibold text-gray-900">Избери местоположение</h3>
									<p class="text-sm text-gray-500">Виж продукти в близост до теб</p>
								</div>
								<div class="p-2 max-h-64 overflow-y-auto">
									{#each locations as location}
										<button
											onclick={() => selectLocation(location.name)}
											class="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
										>
											<div class="font-medium text-gray-900">{location.name}</div>
											<div class="text-xs text-gray-500">{location.region}</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
				
				<!-- Trending Searches -->
				<div class="mt-4 pt-4 border-t border-gray-100">
					<p class="text-sm text-gray-500 mb-2">🔥 Популярни търсения:</p>
					<div class="flex flex-wrap gap-2">
						{#each trendingSearches as search}
							<button 
								onclick={() => handleSearch(search)}
								class="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-primary hover:text-white transition-colors"
							>
								{search}
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
		
		<!-- Quick Actions -->
		<div class="mb-8">
			<p class="text-lg font-semibold text-gray-900 mb-4">Започни веднага</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
				{#each quickActions as action}
					<a 
						href={action.href}
						class="group p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all"
					>
						<div class="flex flex-col items-center text-center">
							<div class="w-12 h-12 {action.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
								<svelte:component this={action.icon} size={24} />
							</div>
							<h3 class="font-semibold text-gray-900 mb-1">{action.title}</h3>
							<p class="text-sm text-gray-600">{action.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
		
		<!-- Social Proof -->
		<div class="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-gray-600">
			<div class="flex items-center gap-2">
				<Users size={16} />
				<span><strong>50,000+</strong> активни потребители</span>
			</div>
			<div class="flex items-center gap-2">
				<Star size={16} />
				<span><strong>4.8</strong> средна оценка</span>
			</div>
			<div class="flex items-center gap-2">
				<TrendingUp size={16} />
				<span><strong>1000+</strong> нови обяви дневно</span>
			</div>
		</div>
	</div>
</section>

<!-- Click outside to close dropdowns -->
{#if locationOpen}
	<div class="fixed inset-0 z-40" onclick={() => locationOpen = false}></div>
{/if}

<!-- Simple Search Modal (temporary replacement for Command Dialog) -->
{#if searchOpen}
	<div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onclick={() => searchOpen = false}>
		<div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onclick={(e) => e.stopPropagation()}>
			<div class="p-6">
				<div class="mb-6">
					<input 
						bind:value={searchValue}
						type="search"
						placeholder="Търси продукти, марки, категории, потребители..." 
						class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-lg"
						autofocus
					/>
				</div>
				
				{#if searchValue === '' && recentSearches.length > 0}
					<div class="mb-6">
						<h3 class="text-sm font-medium text-gray-900 mb-3">Скорошни търсения</h3>
						<div class="space-y-1">
							{#each recentSearches as search}
								<button 
									onclick={() => handleSearch(search)}
									class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
								>
									<Search size={16} class="text-gray-400" />
									<span class="flex-1">{search}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
				
				{#if searchValue === ''}
					<div class="mb-6">
						<h3 class="text-sm font-medium text-gray-900 mb-3">Популярни търсения</h3>
						<div class="space-y-1">
							{#each trendingSearches as search}
								<button 
									onclick={() => handleSearch(search)}
									class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg"
								>
									<TrendingUp size={16} class="text-orange-500" />
									<span class="flex-1">{search}</span>
									<span class="text-xs text-gray-500">Популярно</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}
				
				<div>
					<h3 class="text-sm font-medium text-gray-900 mb-3">Категории</h3>
					<div class="space-y-1">
						<button onclick={() => handleSearch('дамски дрехи')} class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
							<span>👗</span>
							<span>Дамски дрехи</span>
						</button>
						<button onclick={() => handleSearch('мъжки дрехи')} class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
							<span>👔</span>
							<span>Мъжки дрехи</span>
						</button>
						<button onclick={() => handleSearch('обувки')} class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
							<span>👟</span>
							<span>Обувки</span>
						</button>
						<button onclick={() => handleSearch('електроника')} class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg">
							<span>📱</span>
							<span>Електроника</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}