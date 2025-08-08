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
		'Зимни обувки',
	];

	// Quick action categories
	let quickActions = [
		{
			icon: Camera,
			title: 'Снимай и продавай',
			description: 'Направи снимка с телефона си',
			color: 'bg-blue-50 text-blue-600',
			href: '/sell?type=photo',
		},
		{
			icon: Zap,
			title: 'Бързо обява',
			description: 'Готова за 2 минути',
			color: 'bg-green-50 text-green-600',
			href: '/sell?type=quick',
		},
		{
			icon: TrendingUp,
			title: 'Търсени продукти',
			description: 'Виж какво се търси',
			color: 'bg-purple-50 text-purple-600',
			href: '/trending',
		},
	];

	// Location suggestions
	let locations = [
		{ name: 'София', region: 'София-град' },
		{ name: 'Пловдив', region: 'Пловдивска област' },
		{ name: 'Варна', region: 'Варненска область' },
		{ name: 'Бургас', region: 'Бургаска област' },
		{ name: 'Русе', region: 'Русенска област' },
		{ name: 'Стара Загора', region: 'Старозагорска област' },
	];

	// Recent searches (mock data)
	let recentSearches = ['Зимно яке', 'iPhone чехол', 'Adidas маратонки'];

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
	<div class="mx-auto max-w-4xl px-4 text-center">
		<!-- Hero Title -->
		<div class="mb-8">
			<h1 class="mb-4 text-3xl font-bold text-gray-900 md:text-5xl">
				Намери своя <span class="text-primary">перфектен</span> стил
			</h1>
			<p class="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
				Най-голямата платформа за втора употреба мода в България. Над 50,000 продукта, 10,000+
				доволни потребители.
			</p>
		</div>

		<!-- Advanced Search -->
		<div class="mb-8">
			<div class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
				<!-- Search Input -->
				<div class="flex flex-col gap-4 md:flex-row">
					<div class="flex-1">
						<button
							onclick={() => (searchOpen = true)}
							class="hover:border-primary/30 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-gray-500 transition-all hover:bg-gray-100"
						>
							<Search size={20} />
							<span class="flex-1">Търси продукти, марки, категории...</span>
						</button>
					</div>

					<!-- Location Selector -->
					<div class="relative">
						<button
							onclick={() => (locationOpen = !locationOpen)}
							class="hover:border-primary/30 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 transition-all hover:bg-gray-100"
						>
							<MapPin size={16} />
							<span class="whitespace-nowrap">{selectedLocation}</span>
						</button>
						{#if locationOpen}
							<div
								class="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg"
							>
								<div class="border-b border-gray-100 p-4">
									<h3 class="font-semibold text-gray-900">Избери местоположение</h3>
									<p class="text-sm text-gray-500">Виж продукти в близост до теб</p>
								</div>
								<div class="max-h-64 overflow-y-auto p-2">
									{#each locations as location}
										<button
											onclick={() => selectLocation(location.name)}
											class="w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
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
				<div class="mt-4 border-t border-gray-100 pt-4">
					<p class="mb-2 text-sm text-gray-500">🔥 Популярни търсения:</p>
					<div class="flex flex-wrap gap-2">
						{#each trendingSearches as search}
							<button
								onclick={() => handleSearch(search)}
								class="hover:bg-primary rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:text-white"
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
			<p class="mb-4 text-lg font-semibold text-gray-900">Започни веднага</p>
			<div class="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
				{#each quickActions as action}
					{@const IconComponent = action.icon}
					<a
						href={action.href}
						class="group hover:border-primary/30 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg"
					>
						<div class="flex flex-col items-center text-center">
							<div
								class="h-12 w-12 {action.color} mb-3 flex items-center justify-center rounded-xl transition-transform group-hover:scale-110"
							>
								<IconComponent size={24} />
							</div>
							<h3 class="mb-1 font-semibold text-gray-900">{action.title}</h3>
							<p class="text-sm text-gray-600">{action.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</div>

		<!-- Social Proof -->
		<div class="flex flex-col items-center justify-center gap-8 text-sm text-gray-600 md:flex-row">
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
	<div 
		class="fixed inset-0 z-40" 
		role="button"
		tabindex="0"
		onclick={() => (locationOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (locationOpen = false)}
		aria-label="Close location selector"
	></div>
{/if}

<!-- Simple Search Modal (temporary replacement for Command Dialog) -->
{#if searchOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="dialog"
		aria-modal="true"
		aria-label="Search products"
		tabindex="0"
		onclick={() => (searchOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (searchOpen = false)}
	>
		<div
			class="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white"
			role="document"
		>
			<div class="p-6">
				<div class="mb-6">
					<input
						bind:value={searchValue}
						type="search"
						placeholder="Търси продукти, марки, категории, потребители..."
						class="focus:ring-primary focus:border-primary w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:ring-2"
						aria-label="Search input"
					/>
				</div>

				{#if searchValue === '' && recentSearches.length > 0}
					<div class="mb-6">
						<h3 class="mb-3 text-sm font-medium text-gray-900">Скорошни търсения</h3>
						<div class="space-y-1">
							{#each recentSearches as search}
								<button
									onclick={() => handleSearch(search)}
									class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
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
						<h3 class="mb-3 text-sm font-medium text-gray-900">Популярни търсения</h3>
						<div class="space-y-1">
							{#each trendingSearches as search}
								<button
									onclick={() => handleSearch(search)}
									class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
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
					<h3 class="mb-3 text-sm font-medium text-gray-900">Категории</h3>
					<div class="space-y-1">
						<button
							onclick={() => handleSearch('дамски дрехи')}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
						>
							<span>👗</span>
							<span>Дамски дрехи</span>
						</button>
						<button
							onclick={() => handleSearch('мъжки дрехи')}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
						>
							<span>👔</span>
							<span>Мъжки дрехи</span>
						</button>
						<button
							onclick={() => handleSearch('обувки')}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
						>
							<span>👟</span>
							<span>Обувки</span>
						</button>
						<button
							onclick={() => handleSearch('електроника')}
							class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
						>
							<span>📱</span>
							<span>Електроника</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
