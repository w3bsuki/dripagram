<script lang="ts">
	import { Search, User, Heart, ShoppingBag, Bell, Package, Home, Grid3x3, MessageCircle } from '@lucide/svelte';
	
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
		{ id: 'deals', label: 'Оферти', href: '/deals' }
	];
	
	// Mock notifications
	let notifications = [
		{ id: 1, type: 'like', message: 'Петър хареса твоята обява', time: '5 мин', icon: Heart },
		{ id: 2, type: 'message', message: 'Нова оферта за iPhone 15', time: '1 час', icon: ShoppingBag },
		{ id: 3, type: 'price', message: 'Намаление на продукт от любими', time: '3 часа', icon: Bell }
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
<header class="hidden md:block bg-white sticky top-0 z-50 shadow-sm">
	<!-- Top Bar -->
	<div class="bg-gradient-to-r from-primary to-primary/90 text-white">
		<div class="max-w-7xl mx-auto px-4 py-2">
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
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex items-center justify-between py-4">
			<!-- Logo -->
			<a href="/" class="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
				Driplo.bg
			</a>
			
			<!-- Search -->
			<div class="flex-1 max-w-2xl mx-8">
				<div class="relative">
					<Search size={20} class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						placeholder="Търси сред 50,000+ продукта..."
						bind:value={searchValue}
						onkeydown={handleSearch}
						class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
					/>
					<button 
						onclick={performSearch}
						class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
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
						onclick={() => notificationOpen = !notificationOpen}
						class="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
					>
						<Bell size={20} />
						<span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
					</button>
					
					{#if notificationOpen}
						<div class="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
							<div class="p-4 border-b border-gray-100">
								<h3 class="font-semibold">Известия</h3>
							</div>
							<div class="max-h-96 overflow-y-auto">
								{#each notifications as notification}
									{@const Icon = notification.icon}
									<button class="w-full p-4 hover:bg-gray-50 text-left flex items-start gap-3 border-b border-gray-50">
										<div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
											<Icon size={16} class="text-primary" />
										</div>
										<div class="flex-1">
											<p class="text-sm font-medium text-gray-900">{notification.message}</p>
											<p class="text-xs text-gray-500 mt-1">{notification.time}</p>
										</div>
									</button>
								{/each}
							</div>
							<a href="/notifications" class="block p-3 text-center text-sm text-primary hover:bg-gray-50 font-medium">
								Виж всички
							</a>
						</div>
					{/if}
				</div>
				
				<!-- Other Actions -->
				<a href="/favorites" class="p-2.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
					<Heart size={20} />
				</a>
				<a href="/messages" class="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
					<MessageCircle size={20} />
					<span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">2</span>
				</a>
				<a href="/profile" class="p-2.5 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
					<User size={20} />
				</a>
				
				<!-- Sell Button -->
				<a href="/sell" class="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 ml-2">
					<Package size={18} />
					<span>Продай</span>
				</a>
			</div>
		</div>
		
		<!-- Category Navigation -->
		<nav class="border-t border-gray-100 -mx-4 px-4 overflow-x-auto scrollbar-hide">
			<div class="flex items-center gap-1 py-3">
				{#each categories as category}
					<a 
						href={category.href}
						onclick={() => activeCategory = category.id}
						class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap {
							activeCategory === category.id 
								? 'bg-primary text-white' 
								: 'text-gray-600 hover:text-primary hover:bg-primary/5'
						}"
					>
						{category.label}
					</a>
				{/each}
			</div>
		</nav>
	</div>
</header>

<!-- Mobile Header -->
<header class="md:hidden bg-white sticky top-0 z-50 shadow-sm">
	<div class="px-4 py-3">
		<div class="flex items-center justify-between">
			<!-- Logo -->
			<a href="/" class="text-xl font-bold text-primary">
				Driplo
			</a>
			
			<!-- Actions -->
			<div class="flex items-center gap-2">
				<button 
					onclick={() => searchOpen = true}
					class="p-2 text-gray-600"
				>
					<Search size={22} />
				</button>
				<a href="/messages" class="relative p-2 text-gray-600">
					<MessageCircle size={22} />
					{#if true}
						<span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full"></span>
					{/if}
				</a>
				<a href="/sell" class="bg-primary text-white px-3 py-1.5 rounded-full text-sm font-medium">
					Продай
				</a>
			</div>
		</div>
	</div>
	
	<!-- Categories Scroll -->
	<div class="border-t border-gray-100 overflow-x-auto scrollbar-hide">
		<div class="flex items-center gap-2 px-4 py-2">
			{#each categories as category}
				<a 
					href={category.href}
					onclick={() => activeCategory = category.id}
					class="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap {
						activeCategory === category.id 
							? 'bg-primary text-white' 
							: 'bg-gray-100 text-gray-700'
					}"
				>
					{category.label}
				</a>
			{/each}
		</div>
	</div>
</header>

<!-- Mobile Search Modal -->
{#if searchOpen}
	<div class="fixed inset-0 bg-white z-50 md:hidden">
		<div class="flex items-center gap-3 p-4 border-b border-gray-200">
			<button onclick={() => searchOpen = false} class="text-gray-600">
				<Search size={24} />
			</button>
			<input
				type="search"
				placeholder="Търси продукти..."
				bind:value={searchValue}
				onkeydown={handleSearch}
				class="flex-1 text-lg outline-none"
				autofocus
			/>
			{#if searchValue}
				<button onclick={performSearch} class="text-primary font-medium">
					Търси
				</button>
			{:else}
				<button onclick={() => searchOpen = false} class="text-gray-500">
					Отказ
				</button>
			{/if}
		</div>
		
		<!-- Search suggestions -->
		<div class="p-4">
			<h3 class="text-sm font-medium text-gray-500 mb-3">Популярни търсения</h3>
			<div class="space-y-3">
				{#each ['iPhone 15', 'Nike Air Max', 'Зимно яке', 'PlayStation 5'] as suggestion}
					<button 
						onclick={() => { searchValue = suggestion; performSearch(); }}
						class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
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
	<div class="fixed inset-0 z-40" onclick={() => notificationOpen = false}></div>
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