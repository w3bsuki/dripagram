<script lang="ts">
	import {
		Plus,
		Search,
		MessageCircle,
		Bell,
		ChevronUp,
		Users,
		TrendingUp,
		Zap,
	} from '@lucide/svelte';
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
		{ user: 'Ани Д.', action: 'публикува нова обява', time: '2 мин', item: 'Zara яке' },
	]);

	// Stats
	let stats = {
		activeUsers: 1247,
		todayDeals: 89,
		newListings: 156,
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
					price: Math.floor(Math.random() * 500) + 50,
				},
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
	<div
		class="fixed right-4 bottom-20 z-40 transition-all duration-300 {isVisible
			? 'translate-y-0 opacity-100'
			: 'translate-y-16 opacity-0'}"
	>
		<div class="relative">
			<!-- Main FAB -->
			<SellWizard trigger="+" />

			<!-- Quick Actions (when scrolled) -->
			{#if showFloatingActions}
				<div class="absolute right-0 bottom-16 space-y-3 transition-all duration-300">
					<button
						onclick={scrollToTop}
						class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:bg-gray-50 active:scale-95"
					>
						<ChevronUp size={20} />
					</button>
					<a
						href="/search"
						class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:bg-gray-50 active:scale-95"
					>
						<Search size={20} />
					</a>
					<a
						href="/messages"
						class="relative flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-lg transition-all hover:bg-gray-50 active:scale-95"
					>
						<MessageCircle size={20} />
						<span
							class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white"
							>3</span
						>
					</a>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Desktop Smart CTAs -->
{#if !isMobile}
	<!-- Sticky Social Proof Bar -->
	<div
		class="fixed top-20 right-4 z-30 max-w-xs rounded-lg border border-gray-200 bg-white p-4 shadow-lg {isVisible
			? 'translate-x-0 opacity-100'
			: 'translate-x-full opacity-0'} transition-all duration-300"
	>
		<div class="mb-3 flex items-center gap-2">
			<div class="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
			<span class="text-sm font-medium text-gray-900">Активност в момента</span>
		</div>

		<div class="mb-4 space-y-2">
			{#each liveActivity as activity}
				<div class="py-1 text-xs text-gray-600">
					<span class="font-medium">{activity.user}</span>
					{activity.action}
					{#if activity.price}
						<span class="text-primary font-medium">за {activity.price} лв</span>
					{/if}
					<span class="text-gray-400">• {activity.time}</span>
				</div>
			{/each}
		</div>

		<div class="space-y-1 border-t border-gray-200 pt-3">
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
	<div
		class="fixed right-0 bottom-0 left-0 z-30 border-t border-gray-200 bg-white shadow-lg transition-all duration-300"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
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
				<a href="/products" class="text-primary font-medium hover:underline">
					Разгледай всички продукти
				</a>
				<SellWizard trigger="Продай сега" />
			</div>
		</div>
	</div>
{/if}

<!-- Newsletter CTA -->
<section class="from-primary bg-gradient-to-r to-blue-600 py-16 text-white">
	<div class="mx-auto max-w-4xl px-4 text-center">
		<div class="mb-6 flex items-center justify-center">
			<div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
				<Bell size={32} />
			</div>
		</div>

		<h2 class="mb-4 text-2xl font-bold md:text-3xl">Никога не пропускай добра сделка</h2>
		<p class="mx-auto mb-8 max-w-2xl text-lg opacity-90">
			Получавай известия за нови продукти в любимите си категории, ексклузивни оферти и съвети за
			по-добри продажби.
		</p>

		<div class="mx-auto mb-8 max-w-md">
			<div class="flex gap-3">
				<input
					type="email"
					placeholder="Твоя email адрес"
					class="flex-1 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 outline-none"
				/>
				<button
					class="text-primary rounded-lg bg-white px-6 py-3 font-medium transition-colors hover:bg-gray-100"
				>
					Абонирай се
				</button>
			</div>
			<p class="mt-2 text-sm opacity-75">Без спам. Можеш да се отпишеш по всяко време.</p>
		</div>

		<div class="flex flex-col items-center justify-center gap-6 text-sm opacity-90 sm:flex-row">
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
<section class="bg-gray-900 py-12 text-white">
	<div class="mx-auto max-w-4xl px-4 text-center">
		<h2 class="mb-4 text-xl font-bold md:text-2xl">Скоро: Мобилното приложение на Driplo.bg</h2>
		<p class="mb-8 text-gray-300">
			Продавай и купувай още по-лесно с нашето мобилно приложение. Бъди първи, който ще го изпроба!
		</p>

		<div class="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
			<div class="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 opacity-75">
				<div class="text-sm text-gray-400">Скоро в</div>
				<div class="font-semibold">App Store</div>
			</div>
			<div class="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 opacity-75">
				<div class="text-sm text-gray-400">Скоро в</div>
				<div class="font-semibold">Google Play</div>
			</div>
		</div>

		<button
			class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-3 font-medium text-white transition-colors"
		>
			Извести ме при стартирането
		</button>
	</div>
</section>
