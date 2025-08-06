<script lang="ts">
	import { ChevronRight, TrendingUp, Users, Eye } from '@lucide/svelte';

	// Category data with enhanced information
	let categories = [
		{
			id: 'women',
			title: 'Дамски',
			emoji: '👗',
			description: 'Мода, обувки, аксесоари',
			itemCount: '25,847',
			trending: true,
			gradient: 'from-pink-500 to-rose-400',
			bgPattern: 'bg-gradient-to-br from-pink-50 to-rose-50',
			href: '/categories/women',
		},
		{
			id: 'men',
			title: 'Мъжки',
			emoji: '👔',
			description: 'Дрехи, обувки, часовници',
			itemCount: '18,293',
			trending: false,
			gradient: 'from-blue-500 to-indigo-400',
			bgPattern: 'bg-gradient-to-br from-blue-50 to-indigo-50',
			href: '/categories/men',
		},
		{
			id: 'kids',
			title: 'Детски',
			emoji: '🧸',
			description: 'Дрехи, играчки, обувки',
			itemCount: '12,456',
			trending: true,
			gradient: 'from-green-500 to-emerald-400',
			bgPattern: 'bg-gradient-to-br from-green-50 to-emerald-50',
			href: '/categories/kids',
		},
		{
			id: 'electronics',
			title: 'Електроника',
			emoji: '📱',
			description: 'Телефони, лаптопи, камери',
			itemCount: '8,975',
			trending: true,
			gradient: 'from-purple-500 to-violet-400',
			bgPattern: 'bg-gradient-to-br from-purple-50 to-violet-50',
			href: '/categories/electronics',
		},
		{
			id: 'home',
			title: 'Дом и градина',
			emoji: '🏠',
			description: 'Мебели, декорация, инструменти',
			itemCount: '15,632',
			trending: false,
			gradient: 'from-orange-500 to-amber-400',
			bgPattern: 'bg-gradient-to-br from-orange-50 to-amber-50',
			href: '/categories/home',
		},
		{
			id: 'sports',
			title: 'Спорт',
			emoji: '⚽',
			description: 'Екипировка, фитнес, велосипеди',
			itemCount: '9,847',
			trending: false,
			gradient: 'from-teal-500 to-cyan-400',
			bgPattern: 'bg-gradient-to-br from-teal-50 to-cyan-50',
			href: '/categories/sports',
		},
		{
			id: 'beauty',
			title: 'Красота',
			emoji: '💄',
			description: 'Козметика, парфюми, грижа',
			itemCount: '6,428',
			trending: true,
			gradient: 'from-rose-500 to-pink-400',
			bgPattern: 'bg-gradient-to-br from-rose-50 to-pink-50',
			href: '/categories/beauty',
		},
		{
			id: 'books',
			title: 'Книги',
			emoji: '📚',
			description: 'Романи, учебници, комикси',
			itemCount: '4,293',
			trending: false,
			gradient: 'from-slate-500 to-gray-400',
			bgPattern: 'bg-gradient-to-br from-slate-50 to-gray-50',
			href: '/categories/books',
		},
	];

	// Format number for display
	function formatNumber(num: string): string {
		return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	}
</script>

<section class="bg-white py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4">
		<!-- Section Header -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Разгледай категориите</h2>
			<p class="mx-auto max-w-2xl text-lg text-gray-600">
				Над 100,000 продукта в 8 главни категории. Намери точно това, което търсиш.
			</p>
		</div>

		<!-- Category Grid -->
		<div class="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
			{#each categories as category}
				<a
					href={category.href}
					class="group relative overflow-hidden rounded-2xl {category.bgPattern} transform border border-gray-200 transition-all duration-300 hover:scale-105 hover:border-transparent hover:shadow-xl"
				>
					<!-- Trending Badge -->
					{#if category.trending}
						<div class="absolute top-3 right-3 z-10">
							<div
								class="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-orange-600 backdrop-blur-sm"
							>
								<TrendingUp size={12} />
								<span>Популярно</span>
							</div>
						</div>
					{/if}

					<!-- Card Content -->
					<div class="flex h-full flex-col p-6">
						<!-- Icon -->
						<div class="mb-4">
							<div
								class="h-16 w-16 bg-gradient-to-br {category.gradient} flex items-center justify-center rounded-2xl text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
							>
								{category.emoji}
							</div>
						</div>

						<!-- Content -->
						<div class="flex-1">
							<h3
								class="group-hover:text-primary mb-2 text-lg font-bold text-gray-900 transition-colors"
							>
								{category.title}
							</h3>
							<p class="mb-3 line-clamp-2 text-sm text-gray-600">
								{category.description}
							</p>
						</div>

						<!-- Stats -->
						<div class="space-y-2">
							<div class="flex items-center justify-between text-xs text-gray-500">
								<div class="flex items-center gap-1">
									<Eye size={12} />
									<span>{formatNumber(category.itemCount)} продукта</span>
								</div>
								<ChevronRight
									size={14}
									class="group-hover:text-primary text-gray-400 transition-all group-hover:translate-x-1"
								/>
							</div>
						</div>
					</div>

					<!-- Hover Gradient Overlay -->
					<div
						class="absolute inset-0 bg-gradient-to-br {category.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5"
					></div>
				</a>
			{/each}
		</div>

		<!-- View All Categories -->
		<div class="mt-12 text-center">
			<a
				href="/categories"
				class="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
			>
				<Users size={20} />
				<span>Виж всички категории</span>
				<ChevronRight size={16} />
			</a>
		</div>
	</div>
</section>

<style>
	/* Line clamp utility for text truncation */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Enhanced hover effects */
	.group:hover .group-hover\:translate-x-1 {
		transform: translateX(0.25rem);
	}

	/* Smooth scaling animation */
	@media (prefers-reduced-motion: no-preference) {
		.group {
			transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		}
	}

	/* Disable animations for users who prefer reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.group {
			transition: none;
		}

		.group:hover {
			transform: none;
		}
	}
</style>
