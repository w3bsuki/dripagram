<script lang="ts">
	import { Search, Camera, Zap, TrendingUp, MapPin, Star, Users } from '@lucide/svelte';
	import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut } from '$lib/components/native';

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
			color: 'bg-primary/10 text-primary',
			href: '/sell?type=photo',
		},
		{
			icon: Zap,
			title: 'Бързо обява',
			description: 'Готова за 2 минути',
			color: 'bg-success/10 text-success',
			href: '/sell?type=quick',
		},
		{
			icon: TrendingUp,
			title: 'Търсени продукти',
			description: 'Виж какво се търси',
			color: 'bg-accent/10 text-accent-foreground',
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

	let recentSearches: string[] = [];

	function handleSearch(query: string) {
		searchValue = query;
		searchOpen = false;
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

<!-- Command Dialog for Search -->
<CommandDialog bind:open={searchOpen}>
	<CommandInput placeholder="Търси продукти, марки, категории, потребители..." />
	<CommandList>
		<CommandEmpty>Няма резултати.</CommandEmpty>

		{#if recentSearches.length > 0}
			<CommandGroup heading="Скорошни търсения">
				{#each recentSearches as search}
					<CommandItem
						value={search}
						onSelect={() => handleSearch(search)}
					>
						<Search size={16} class="mr-2 text-gray-400" />
						{search}
					</CommandItem>
				{/each}
			</CommandGroup>
			<CommandSeparator />
		{/if}

		<CommandGroup heading="Популярни търсения">
			{#each trendingSearches as search}
				<CommandItem
					value={search}
					onSelect={() => handleSearch(search)}
				>
					<TrendingUp size={16} class="mr-2 text-orange-500" />
					{search}
					<CommandShortcut>Популярно</CommandShortcut>
				</CommandItem>
			{/each}
		</CommandGroup>

		<CommandSeparator />

		<CommandGroup heading="Категории">
			<CommandItem value="дамски дрехи" onSelect={() => handleSearch('дамски дрехи')}>
				<span class="mr-2">👗</span>
				Дамски дрехи
			</CommandItem>
			<CommandItem value="мъжки дрехи" onSelect={() => handleSearch('мъжки дрехи')}>
				<span class="mr-2">👔</span>
				Мъжки дрехи
			</CommandItem>
			<CommandItem value="обувки" onSelect={() => handleSearch('обувки')}>
				<span class="mr-2">👟</span>
				Обувки
			</CommandItem>
			<CommandItem value="електроника" onSelect={() => handleSearch('електроника')}>
				<span class="mr-2">📱</span>
				Електроника
			</CommandItem>
		</CommandGroup>
	</CommandList>
</CommandDialog>
