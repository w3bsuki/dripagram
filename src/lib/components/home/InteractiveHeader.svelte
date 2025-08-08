<script lang="ts">
	import {
		Search,
		User,
		Heart,
		ShoppingBag,
		Bell,
		Package,
		Home,
		Grid3x3,
		MessageCircle,
	} from '@lucide/svelte';

	let searchOpen = $state(false);
	let mobileMenuOpen = $state(false);
	let notificationOpen = $state(false);
	let searchValue = $state('');
	let activeCategory = $state('all');

	// Categories for quick navigation
	let categories = [
		{ id: 'all', label: 'Всички', href: '/browse' },
		{ id: 'women', label: 'Дамски', href: '/women' },
		{ id: 'men', label: 'Мъжки', href: '/men' },
		{ id: 'kids', label: 'Детски', href: '/kids' },
		{ id: 'tech', label: 'Техника', href: '/electronics' },
		{ id: 'home', label: 'Дом', href: '/home' },
		{ id: 'luxury', label: 'Луксозни', href: '/luxury' },
		{ id: 'deals', label: 'Оферти', href: '/deals' },
	];

	// Mock notifications
	let notifications = [
		{ id: 1, type: 'like', message: 'Петър хареса твоята обява', time: '5 мин', icon: Heart },
		{
			id: 2,
			type: 'message',
			message: 'Нова оферта за iPhone 15',
			time: '1 час',
			icon: ShoppingBag,
		},
		{ id: 3, type: 'price', message: 'Намаление на продукт от любими', time: '3 часа', icon: Bell },
	];

	function handleSearch(e: KeyboardEvent) {
		if (e.key === 'Enter' && searchValue) {
			window.location.href = `/search?q=${encodeURIComponent(searchValue)}`;
			searchOpen = false;
		}
	}

	function performSearch() {
		if (searchValue) {
			window.location.href = `/search?q=${encodeURIComponent(searchValue)}`;
			searchOpen = false;
		}
	}
</script>

<!-- Desktop Header -->
<header class="sticky top-0 z-50 hidden bg-white shadow-sm md:block">
	<!-- Top Bar -->
	<div class="from-primary to-primary/90 bg-gradient-to-r text-white">
		<div class="mx-auto max-w-7xl px-4 py-2">
			<div class="flex items-center justify-between text-sm">
				<div class="flex items-center gap-4">
					<span>📍 Цяла България</span>
					<span>📞 0888 123 456</span>
				</div>
				<div class="flex items-center gap-4">
					<a href="/sell" class="flex items-center gap-1 hover:text-white/90">
						✨ Продай безплатно
					</a>
					<span>|</span>
					<a href="/help" class="hover:text-white/90">Помощ</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Header -->
	<div class="mx-auto max-w-7xl px-4">
		<div class="flex items-center justify-between py-4">
			<!-- Logo -->
			<a
				href="/"
				class="from-primary bg-gradient-to-r to-blue-600 bg-clip-text text-2xl font-bold text-transparent"
			>
				Driplo.bg
			</a>

			<!-- Search -->
			<div class="mx-8 max-w-2xl flex-1">
				<div class="relative">
					<Search size={20} class="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						placeholder="Търси сред 50,000+ продукта..."
						bind:value={searchValue}
						onkeydown={handleSearch}
						class="focus:border-primary focus:ring-primary/20 w-full rounded-full border border-gray-200 bg-gray-50 py-3 pr-4 pl-12 transition-all outline-none focus:bg-white focus:ring-2"
					/>
					<button
						onclick={performSearch}
						class="bg-primary hover:bg-primary/90 absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-4 py-1.5 text-sm font-medium text-white transition-colors"
					>
						Търси
					</button>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<!-- Notifications -->
				<div class="relative">
					<button
						onclick={() => (notificationOpen = !notificationOpen)}
						class="relative rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
					>
						<Bell size={20} />
						<span
							class="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
							>3</span
						>
					</button>

					{#if notificationOpen}
						<div
							class="absolute top-full right-0 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
						>
							<div class="border-b border-gray-100 p-4">
								<h3 class="font-semibold">Известия</h3>
							</div>
							<div class="max-h-96 overflow-y-auto">
								{#each notifications as notification}
									{@const Icon = notification.icon}
									<button
										class="flex w-full items-start gap-3 border-b border-gray-50 p-4 text-left hover:bg-gray-50"
									>
										<div
											class="bg-primary/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
										>
											<Icon size={16} class="text-primary" />
										</div>
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900">{notification.message}</p>
											<p class="mt-1 text-xs text-gray-500">{notification.time}</p>
										</div>
									</button>
								{/each}
							</div>
							<a
								href="/notifications"
								class="text-primary block p-3 text-center text-sm font-medium hover:bg-gray-50"
							>
								Виж всички
							</a>
						</div>
					{/if}
				</div>

				<!-- Other Actions -->
				<a
					href="/favorites"
					class="rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
				>
					<Heart size={20} />
				</a>
				<a
					href="/messages"
					class="relative rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
				>
					<MessageCircle size={20} />
					<span
						class="bg-primary absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white"
						>2</span
					>
				</a>
				<a
					href="/profile"
					class="rounded-full p-2.5 text-gray-600 transition-colors hover:bg-gray-50"
				>
					<User size={20} />
				</a>

				<!-- Sell Button -->
				<a
					href="/sell"
					class="bg-primary hover:bg-primary/90 ml-2 flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white transition-colors"
				>
					<Package size={18} />
					<span>Продай</span>
				</a>
			</div>
		</div>

		<!-- Category Navigation -->
		<nav class="scrollbar-hide -mx-4 overflow-x-auto border-t border-gray-100 px-4">
			<div class="flex items-center gap-1 py-3">
				{#each categories as category}
					<a
						href={category.href}
						onclick={() => (activeCategory = category.id)}
						class="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all {activeCategory ===
						category.id
							? 'bg-primary text-white'
							: 'hover:text-primary hover:bg-primary/5 text-gray-600'}"
					>
						{category.label}
					</a>
				{/each}
			</div>
		</nav>
	</div>
</header>

<!-- Mobile Header -->
<header class="sticky top-0 z-50 bg-white shadow-sm md:hidden">
	<div class="px-4 py-3">
		<div class="flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="text-primary text-xl font-bold"> Driplo </a>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<button onclick={() => (searchOpen = true)} class="p-2 text-gray-600">
					<Search size={22} />
				</button>
				<a href="/messages" class="relative p-2 text-gray-600">
					<MessageCircle size={22} />
					{#if true}
						<span class="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500"></span>
					{/if}
				</a>
				<a href="/sell" class="bg-primary rounded-full px-3 py-1.5 text-sm font-medium text-white">
					Продай
				</a>
			</div>
		</div>
	</div>

	<!-- Categories Scroll -->
	<div class="scrollbar-hide overflow-x-auto border-t border-gray-100">
		<div class="flex items-center gap-2 px-4 py-2">
			{#each categories as category}
				<a
					href={category.href}
					onclick={() => (activeCategory = category.id)}
					class="flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all {activeCategory ===
					category.id
						? 'bg-primary text-white'
						: 'bg-gray-100 text-gray-700'}"
				>
					{category.label}
				</a>
			{/each}
		</div>
	</div>
</header>

<!-- Mobile Search Modal -->
{#if searchOpen}
	<div class="fixed inset-0 z-50 bg-white md:hidden">
		<div class="flex items-center gap-3 border-b border-gray-200 p-4">
			<button onclick={() => (searchOpen = false)} class="text-gray-600">
				<Search size={24} />
			</button>
			<input
				type="search"
				placeholder="Търси продукти..."
				bind:value={searchValue}
				onkeydown={handleSearch}
				class="flex-1 text-lg outline-none"
				aria-label="Search products"
			/>
			{#if searchValue}
				<button onclick={performSearch} class="text-primary font-medium"> Търси </button>
			{:else}
				<button onclick={() => (searchOpen = false)} class="text-gray-500"> Отказ </button>
			{/if}
		</div>

		<!-- Search suggestions -->
		<div class="p-4">
			<h3 class="mb-3 text-sm font-medium text-gray-500">Популярни търсения</h3>
			<div class="space-y-3">
				{#each ['iPhone 15', 'Nike Air Max', 'Зимно яке', 'PlayStation 5'] as suggestion}
					<button
						onclick={() => {
							searchValue = suggestion;
							performSearch();
						}}
						class="w-full rounded-lg bg-gray-50 p-3 text-left hover:bg-gray-100"
					>
						{suggestion}
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Click outside handlers -->
{#if notificationOpen}
	<div 
		class="fixed inset-0 z-40" 
		role="button"
		tabindex="0"
		onclick={() => (notificationOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (notificationOpen = false)}
		aria-label="Close notifications"
	></div>
{/if}

<style>
	/* Hide scrollbar */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
