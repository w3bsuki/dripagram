<script lang="ts">
	import { ChevronLeft, ChevronRight, Heart, Eye, MapPin, Star, Verified } from '@lucide/svelte';
	import { onMount } from 'svelte';

	// Props
	let {
		title = 'Препоръчани продукти',
		description = 'Специално подбрани за теб',
		viewAllLink = '/products',
	} = $props();

	// Carousel state
	let carousel: HTMLElement;
	let currentIndex = $state(0);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);
	let isAutoPlaying = $state(true);

	// Sample products data
	let products = [
		{
			id: 1,
			title: 'Елегантна рокля Zara',
			price: 45,
			originalPrice: 89,
			condition: 'Много добро',
			location: 'София',
			image: 'https://picsum.photos/300/400?random=1',
			seller: {
				name: 'Мария К.',
				verified: true,
				rating: 4.9,
				responseTime: '< 1ч',
			},
			likes: 23,
			views: 156,
			isLiked: false,
			tags: ['Популярно', 'Дизайнер'],
		},
		{
			id: 2,
			title: 'iPhone 13 Pro 128GB',
			price: 899,
			originalPrice: 1299,
			condition: 'Отлично',
			location: 'Пловдив',
			image: 'https://picsum.photos/300/400?random=2',
			seller: {
				name: 'Георги М.',
				verified: true,
				rating: 5.0,
				responseTime: '< 30мин',
			},
			likes: 67,
			views: 342,
			isLiked: true,
			tags: ['Топ продавач'],
		},
		{
			id: 3,
			title: 'Nike Air Max 270',
			price: 89,
			originalPrice: 159,
			condition: 'Добро',
			location: 'Варна',
			image: 'https://picsum.photos/300/400?random=3',
			seller: {
				name: 'Стефан П.',
				verified: false,
				rating: 4.7,
				responseTime: '< 2ч',
			},
			likes: 34,
			views: 98,
			isLiked: false,
			tags: ['Спорт'],
		},
		{
			id: 4,
			title: 'Винтидж кожено яке',
			price: 125,
			originalPrice: 299,
			condition: 'Много добро',
			location: 'София',
			image: 'https://picsum.photos/300/400?random=4',
			seller: {
				name: 'Ани Д.',
				verified: true,
				rating: 4.8,
				responseTime: '< 1ч',
			},
			likes: 45,
			views: 203,
			isLiked: false,
			tags: ['Винтидж', 'Популярно'],
		},
		{
			id: 5,
			title: 'Samsung Galaxy Watch',
			price: 189,
			originalPrice: 329,
			condition: 'Отлично',
			location: 'Бургас',
			image: 'https://picsum.photos/300/400?random=5',
			seller: {
				name: 'Иван С.',
				verified: true,
				rating: 4.9,
				responseTime: '< 45мин',
			},
			likes: 28,
			views: 167,
			isLiked: false,
			tags: ['Технологии'],
		},
		{
			id: 6,
			title: 'Дизайнерска чанта',
			price: 79,
			originalPrice: 159,
			condition: 'Добро',
			location: 'София',
			image: 'https://picsum.photos/300/400?random=6',
			seller: {
				name: 'Елена В.',
				verified: false,
				rating: 4.6,
				responseTime: '< 3ч',
			},
			likes: 19,
			views: 87,
			isLiked: true,
			tags: ['Мода'],
		},
	];

	// Scroll functions
	function scrollLeft() {
		if (!carousel) return;
		const scrollAmount = carousel.clientWidth * 0.8;
		carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
	}

	function scrollRight() {
		if (!carousel) return;
		const scrollAmount = carousel.clientWidth * 0.8;
		carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	}

	function updateScrollButtons() {
		if (!carousel) return;
		canScrollLeft = carousel.scrollLeft > 0;
		canScrollRight = carousel.scrollLeft < carousel.scrollWidth - carousel.clientWidth - 10;
	}

	// Auto-play functionality
	let autoPlayInterval: NodeJS.Timeout;

	function startAutoPlay() {
		if (!isAutoPlaying) return;
		autoPlayInterval = setInterval(() => {
			if (canScrollRight) {
				scrollRight();
			} else {
				carousel.scrollTo({ left: 0, behavior: 'smooth' });
			}
		}, 5000);
	}

	function stopAutoPlay() {
		if (autoPlayInterval) {
			clearInterval(autoPlayInterval);
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			scrollLeft();
			stopAutoPlay();
		} else if (event.key === 'ArrowRight') {
			scrollRight();
			stopAutoPlay();
		}
	}

	// Toggle like
	function toggleLike(productId: number) {
		products = products.map((p) =>
			p.id === productId
				? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
				: p
		);
	}

	onMount(() => {
		updateScrollButtons();
		startAutoPlay();

		return () => stopAutoPlay();
	});
</script>

<section class="bg-gray-50 py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4">
		<!-- Section Header -->
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
					{title}
				</h2>
				<p class="text-gray-600">{description}</p>
			</div>

			<!-- Navigation Controls -->
			<div class="hidden items-center gap-4 md:flex">
				<!-- Auto-play toggle -->
				<button
					onclick={() => {
						isAutoPlaying = !isAutoPlaying;
						if (isAutoPlaying) startAutoPlay();
						else stopAutoPlay();
					}}
					class="rounded-full px-3 py-1 text-xs {isAutoPlaying
						? 'bg-primary text-white'
						: 'bg-gray-200 text-gray-600'} transition-colors"
				>
					{isAutoPlaying ? 'Авто' : 'Ръчно'}
				</button>

				<!-- Scroll buttons -->
				<div class="flex gap-2">
					<button
						onclick={scrollLeft}
						disabled={!canScrollLeft}
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						onclick={scrollRight}
						disabled={!canScrollRight}
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<ChevronRight size={20} />
					</button>
				</div>

				<!-- View all link -->
				<a href={viewAllLink} class="text-primary font-medium whitespace-nowrap hover:underline">
					Виж всички →
				</a>
			</div>
		</div>

		<!-- Product Carousel -->
		<div class="relative">
			<div
				bind:this={carousel}
				onscroll={updateScrollButtons}
				onmouseenter={stopAutoPlay}
				onmouseleave={() => isAutoPlaying && startAutoPlay()}
				role="region"
				aria-label="Продукти карусел"
				tabindex="0"
				onkeydown={handleKeydown}
				class="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
				style="scroll-snap-type: x mandatory;"
			>
				{#each products as product}
					<div class="w-72 flex-shrink-0 snap-start">
						<div
							class="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg"
						>
							<!-- Product Image -->
							<div class="relative aspect-[4/3] overflow-hidden">
								<img
									src={product.image}
									alt={product.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									loading="lazy"
								/>

								<!-- Like button -->
								<button
									onclick={() => toggleLike(product.id)}
									class="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white"
								>
									<Heart
										size={16}
										class="{product.isLiked
											? 'fill-red-500 text-red-500'
											: 'text-gray-600'} transition-colors"
									/>
								</button>

								<!-- Tags -->
								{#if product.tags.length > 0}
									<div class="absolute top-3 left-3 flex gap-1">
										{#each product.tags.slice(0, 2) as tag}
											<span
												class="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm"
											>
												{tag}
											</span>
										{/each}
									</div>
								{/if}

								<!-- Views -->
								<div class="absolute bottom-3 left-3">
									<div
										class="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
									>
										<Eye size={12} />
										<span>{product.views}</span>
									</div>
								</div>
							</div>

							<!-- Product Info -->
							<div class="p-4">
								<!-- Title -->
								<h3
									class="group-hover:text-primary mb-2 line-clamp-2 font-semibold text-gray-900 transition-colors"
								>
									{product.title}
								</h3>

								<!-- Price -->
								<div class="mb-3 flex items-center gap-2">
									<span class="text-xl font-bold text-gray-900">{product.price} лв</span>
									{#if product.originalPrice}
										<span class="text-sm text-gray-500 line-through"
											>{product.originalPrice} лв</span
										>
										<span
											class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
										>
											-{Math.round((1 - product.price / product.originalPrice) * 100)}%
										</span>
									{/if}
								</div>

								<!-- Condition & Location -->
								<div class="mb-3 flex items-center justify-between text-sm text-gray-600">
									<span class="font-medium">{product.condition}</span>
									<div class="flex items-center gap-1">
										<MapPin size={12} />
										<span>{product.location}</span>
									</div>
								</div>

								<!-- Seller Info -->
								<div class="flex items-center justify-between border-t border-gray-100 pt-3">
									<div class="flex items-center gap-2">
										<div
											class="from-primary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br to-blue-600 text-sm font-semibold text-white"
										>
											{product.seller.name.charAt(0)}
										</div>
										<div>
											<div class="flex items-center gap-1">
												<span class="text-sm font-medium text-gray-900">{product.seller.name}</span>
												{#if product.seller.verified}
													<Verified size={12} class="text-blue-500" />
												{/if}
											</div>
											<div class="flex items-center gap-1 text-xs text-gray-500">
												<Star size={10} class="fill-yellow-400 text-yellow-400" />
												<span>{product.seller.rating}</span>
												<span>•</span>
												<span>{product.seller.responseTime}</span>
											</div>
										</div>
									</div>

									<!-- Likes -->
									<div class="flex items-center gap-1 text-xs text-gray-500">
										<Heart size={12} />
										<span>{product.likes}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Mobile Navigation -->
			<div class="mt-6 flex items-center justify-between md:hidden">
				<div class="flex gap-2">
					<button
						onclick={scrollLeft}
						disabled={!canScrollLeft}
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						onclick={scrollRight}
						disabled={!canScrollRight}
						class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<ChevronRight size={20} />
					</button>
				</div>

				<a href={viewAllLink} class="text-primary font-medium hover:underline"> Виж всички → </a>
			</div>
		</div>
	</div>
</section>

<style>
	/* Hide scrollbar but keep functionality */
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* Line clamp utility */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Smooth focus outline */
	[tabindex='0']:focus {
		outline: 2px solid hsl(var(--primary));
		outline-offset: 2px;
	}
</style>
