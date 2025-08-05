<script lang="ts">
	import { ChevronLeft, ChevronRight, Heart, Eye, MapPin, Star, Verified } from '@lucide/svelte';
	import { onMount } from 'svelte';
	
	// Props
	let { 
		title = 'Препоръчани продукти',
		description = 'Специално подбрани за теб',
		viewAllLink = '/products'
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
				responseTime: '< 1ч'
			},
			likes: 23,
			views: 156,
			isLiked: false,
			tags: ['Популярно', 'Дизайнер']
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
				responseTime: '< 30мин'
			},
			likes: 67,
			views: 342,
			isLiked: true,
			tags: ['Топ продавач']
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
				responseTime: '< 2ч'
			},
			likes: 34,
			views: 98,
			isLiked: false,
			tags: ['Спорт']
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
				responseTime: '< 1ч'
			},
			likes: 45,
			views: 203,
			isLiked: false,
			tags: ['Винтидж', 'Популярно']
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
				responseTime: '< 45мин'
			},
			likes: 28,
			views: 167,
			isLiked: false,
			tags: ['Технологии']
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
				responseTime: '< 3ч'
			},
			likes: 19,
			views: 87,
			isLiked: true,
			tags: ['Мода']
		}
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
		products = products.map(p => 
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

<section class="py-12 md:py-16 bg-gray-50">
	<div class="max-w-7xl mx-auto px-4">
		<!-- Section Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
					{title}
				</h2>
				<p class="text-gray-600">{description}</p>
			</div>
			
			<!-- Navigation Controls -->
			<div class="hidden md:flex items-center gap-4">
				<!-- Auto-play toggle -->
				<button
					onclick={() => {
						isAutoPlaying = !isAutoPlaying;
						if (isAutoPlaying) startAutoPlay();
						else stopAutoPlay();
					}}
					class="text-xs px-3 py-1 rounded-full {isAutoPlaying ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} transition-colors"
				>
					{isAutoPlaying ? 'Авто' : 'Ръчно'}
				</button>
				
				<!-- Scroll buttons -->
				<div class="flex gap-2">
					<button
						onclick={scrollLeft}
						disabled={!canScrollLeft}
						class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						onclick={scrollRight}
						disabled={!canScrollRight}
						class="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					>
						<ChevronRight size={20} />
					</button>
				</div>
				
				<!-- View all link -->
				<a 
					href={viewAllLink}
					class="text-primary font-medium hover:underline whitespace-nowrap"
				>
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
				class="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2"
				style="scroll-snap-type: x mandatory;"
			>
				{#each products as product}
					<div class="flex-shrink-0 w-72 snap-start">
						<div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
							<!-- Product Image -->
							<div class="relative aspect-[4/3] overflow-hidden">
								<img 
									src={product.image}
									alt={product.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									loading="lazy"
								/>
								
								<!-- Like button -->
								<button
									onclick={() => toggleLike(product.id)}
									class="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
								>
									<Heart 
										size={16} 
										class="{product.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'} transition-colors" 
									/>
								</button>
								
								<!-- Tags -->
								{#if product.tags.length > 0}
									<div class="absolute top-3 left-3 flex gap-1">
										{#each product.tags.slice(0, 2) as tag}
											<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
												{tag}
											</span>
										{/each}
									</div>
								{/if}
								
								<!-- Views -->
								<div class="absolute bottom-3 left-3">
									<div class="flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
										<Eye size={12} />
										<span>{product.views}</span>
									</div>
								</div>
							</div>
							
							<!-- Product Info -->
							<div class="p-4">
								<!-- Title -->
								<h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
									{product.title}
								</h3>
								
								<!-- Price -->
								<div class="flex items-center gap-2 mb-3">
									<span class="text-xl font-bold text-gray-900">{product.price} лв</span>
									{#if product.originalPrice}
										<span class="text-sm text-gray-500 line-through">{product.originalPrice} лв</span>
										<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
											-{Math.round((1 - product.price / product.originalPrice) * 100)}%
										</span>
									{/if}
								</div>
								
								<!-- Condition & Location -->
								<div class="flex items-center justify-between text-sm text-gray-600 mb-3">
									<span class="font-medium">{product.condition}</span>
									<div class="flex items-center gap-1">
										<MapPin size={12} />
										<span>{product.location}</span>
									</div>
								</div>
								
								<!-- Seller Info -->
								<div class="flex items-center justify-between pt-3 border-t border-gray-100">
									<div class="flex items-center gap-2">
										<div class="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
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
			<div class="flex md:hidden items-center justify-between mt-6">
				<div class="flex gap-2">
					<button
						onclick={scrollLeft}
						disabled={!canScrollLeft}
						class="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ChevronLeft size={20} />
					</button>
					<button
						onclick={scrollRight}
						disabled={!canScrollRight}
						class="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ChevronRight size={20} />
					</button>
				</div>
				
				<a 
					href={viewAllLink}
					class="text-primary font-medium hover:underline"
				>
					Виж всички →
				</a>
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
	[tabindex="0"]:focus {
		outline: 2px solid hsl(var(--primary));
		outline-offset: 2px;
	}
</style>