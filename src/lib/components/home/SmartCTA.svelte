<script lang="ts">
	import { Plus, Search, MessageCircle, Bell, ChevronUp, Users, TrendingUp, Zap } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import SellWizard from './SellWizard.svelte';
	
	// State
	let isVisible = $state(true);
	let showFloatingActions = $state(false);
	let scrollY = $state(0);
	let lastScrollY = $state(0);
	let isMobile = $state(false);
	
	// Activity data (mock)
	let liveActivity = $state([
		{ user: 'Мария С.', action: 'продаде iPhone 13', time: 'току-що', price: 899 },
		{ user: 'Георги М.', action: 'купи Nike обувки', time: '1 мин', price: 150 },
		{ user: 'Ани Д.', action: 'публикува нова обява', time: '2 мин', item: 'Zara яке' }
	]);
	
	// Stats
	let stats = {
		activeUsers: 1247,
		todayDeals: 89,
		newListings: 156
	};
	
	// Check mobile and handle scroll
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};
		
		const handleScroll = () => {
			scrollY = window.scrollY;
			
			// Hide/show floating button based on scroll direction
			if (scrollY > lastScrollY && scrollY > 100) {
				isVisible = false;
			} else if (scrollY < lastScrollY) {
				isVisible = true;
			}
			
			lastScrollY = scrollY;
			
			// Show floating actions when scrolled down significantly
			showFloatingActions = scrollY > 800;
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		window.addEventListener('scroll', handleScroll);
		
		// Update live activity every 10 seconds
		const activityInterval = setInterval(() => {
			// Rotate activity items (mock real-time updates)
			liveActivity = [
				...liveActivity.slice(1),
				{
					user: `Потребител ${Math.floor(Math.random() * 100)}`,
					action: Math.random() > 0.5 ? 'продаде продукт' : 'публикува обява',
					time: 'току-що',
					price: Math.floor(Math.random() * 500) + 50
				}
			];
			
			// Update stats
			stats.activeUsers += Math.floor(Math.random() * 5) - 2;
			stats.todayDeals += Math.random() > 0.7 ? 1 : 0;
			stats.newListings += Math.random() > 0.8 ? 1 : 0;
		}, 10000);
		
		return () => {
			window.removeEventListener('resize', checkMobile);
			window.removeEventListener('scroll', handleScroll);
			clearInterval(activityInterval);
		};
	});
	
	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<!-- Floating Action Button (Mobile) -->
{#if isMobile}
	<div class="fixed bottom-20 right-4 z-40 transition-all duration-300 {isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}">
		<div class="relative">
			<!-- Main FAB -->
			<SellWizard trigger="+" />
			
			<!-- Quick Actions (when scrolled) -->
			{#if showFloatingActions}
				<div class="absolute bottom-16 right-0 space-y-3 transition-all duration-300">
					<button 
						onclick={scrollToTop}
						class="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
					>
						<ChevronUp size={20} />
					</button>
					<a 
						href="/search"
						class="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
					>
						<Search size={20} />
					</a>
					<a 
						href="/messages"
						class="relative w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
					>
						<MessageCircle size={20} />
						<span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
					</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Desktop Smart CTAs -->
{#if !isMobile}
	<!-- Sticky Social Proof Bar -->
	<div class="fixed top-20 right-4 z-30 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs {isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'} transition-all duration-300">
		<div class="flex items-center gap-2 mb-3">
			<div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
			<span class="text-sm font-medium text-gray-900">Активност в момента</span>
		</div>
		
		<div class="space-y-2 mb-4">
			{#each liveActivity as activity}
				<div class="text-xs text-gray-600 py-1">
					<span class="font-medium">{activity.user}</span>
					{activity.action}
					{#if activity.price}
						<span class="text-primary font-medium">за {activity.price} лв</span>
					{/if}
					<span class="text-gray-400">• {activity.time}</span>
				</div>
			{/each}
		</div>
		
		<div class="border-t border-gray-200 pt-3 space-y-1">
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-600">Онлайн сега:</span>
				<span class="font-medium text-green-600">{stats.activeUsers.toLocaleString()}</span>
			</div>
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-600">Сделки днес:</span>
				<span class="font-medium text-blue-600">{stats.todayDeals}</span>
			</div>
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-600">Нови обяви:</span>
				<span class="font-medium text-purple-600">{stats.newListings}</span>
			</div>
		</div>
	</div>
{/if}

<!-- Bottom CTA Bar (Desktop) -->
{#if !isMobile && scrollY > 1200}
	<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 transition-all duration-300">
		<div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<Users size={20} class="text-green-600" />
					<span class="text-sm text-gray-700">
						<strong>{stats.activeUsers.toLocaleString()}</strong> потребители онлайн
					</span>
				</div>
				<div class="flex items-center gap-2">
					<TrendingUp size={20} class="text-blue-600" />
					<span class="text-sm text-gray-700">
						<strong>{stats.todayDeals}</strong> сделки днес
					</span>
				</div>
			</div>
			
			<div class="flex items-center gap-3">
				<a 
					href="/products"
					class="text-primary font-medium hover:underline"
				>
					Разгледай всички продукти
				</a>
				<SellWizard trigger="Продай сега" />
			</div>
		</div>
	</div>
{/if}

<!-- Newsletter CTA -->
<section class="py-16 bg-gradient-to-r from-primary to-blue-600 text-white">
	<div class="max-w-4xl mx-auto px-4 text-center">
		<div class="flex items-center justify-center mb-6">
			<div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
				<Bell size={32} />
			</div>
		</div>
		
		<h2 class="text-2xl md:text-3xl font-bold mb-4">
			Никога не пропускай добра сделка
		</h2>
		<p class="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
			Получавай известия за нови продукти в любимите си категории, ексклузивни оферти и съвети за по-добри продажби.
		</p>
		
		<div class="max-w-md mx-auto mb-8">
			<div class="flex gap-3">
				<input 
					type="email" 
					placeholder="Твоя email адрес"
					class="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 outline-none"
				/>
				<button class="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
					Абонирай се
				</button>
			</div>
			<p class="text-sm opacity-75 mt-2">
				Без спам. Можеш да се отпишеш по всяко време.
			</p>
		</div>
		
		<div class="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
			<div class="flex items-center gap-2">
				<Zap size={16} />
				<span>Моментални известия</span>
			</div>
			<div class="flex items-center gap-2">
				<TrendingUp size={16} />
				<span>Тренд сигнали</span>
			</div>
			<div class="flex items-center gap-2">
				<Users size={16} />
				<span>15,000+ абонати</span>
			</div>
		</div>
	</div>
</section>

<!-- Download App CTA -->
<section class="py-12 bg-gray-900 text-white">
	<div class="max-w-4xl mx-auto px-4 text-center">
		<h2 class="text-xl md:text-2xl font-bold mb-4">
			Скоро: Мобилното приложение на Driplo.bg
		</h2>
		<p class="text-gray-300 mb-8">
			Продавай и купувай още по-лесно с нашето мобилно приложение. Бъди първи, който ще го изпроба!
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
			<div class="bg-gray-800 border border-gray-700 rounded-lg px-6 py-3 opacity-75">
				<div class="text-sm text-gray-400">Скоро в</div>
				<div class="font-semibold">App Store</div>
			</div>
			<div class="bg-gray-800 border border-gray-700 rounded-lg px-6 py-3 opacity-75">
				<div class="text-sm text-gray-400">Скоро в</div>
				<div class="font-semibold">Google Play</div>
			</div>
		</div>
		
		<button class="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
			Извести ме при стартирането
		</button>
	</div>
</section>