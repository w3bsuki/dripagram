<script lang="ts">
	import { Clock, TrendingUp, MapPin, Heart, Eye, Star } from '@lucide/svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	
	let currentTab = $state('new');
	
	// Sample data for different sections
	let newProducts = [
		{
			id: 1,
			title: 'Нов iPhone 15',
			price: 1299,
			image: 'https://picsum.photos/200/250?random=10',
			timeAgo: '5 мин',
			location: 'София',
			likes: 3,
			views: 12
		},
		{
			id: 2,
			title: 'Винтидж кожена чанта',
			price: 89,
			image: 'https://picsum.photos/200/250?random=11',
			timeAgo: '12 мин',
			location: 'Пловдив',
			likes: 7,
			views: 24
		},
		{
			id: 3,
			title: 'Спортни маратонки Nike',
			price: 150,
			image: 'https://picsum.photos/200/250?random=12',
			timeAgo: '28 мин',
			location: 'Варна',
			likes: 12,
			views: 45
		},
		{
			id: 4,
			title: 'Елегантна рокля',
			price: 65,
			image: 'https://picsum.photos/200/250?random=13',
			timeAgo: '1 ч',
			location: 'София',
			likes: 8,
			views: 33
		}
	];
	
	let popularProducts = [
		{
			id: 5,
			title: 'MacBook Pro M2',
			price: 2299,
			image: 'https://picsum.photos/200/250?random=14',
			likes: 156,
			views: 1240,
			engagement: '98%'
		},
		{
			id: 6,
			title: 'Дизайнерски часовник',
			price: 450,
			image: 'https://picsum.photos/200/250?random=15',
			likes: 89,
			views: 567,
			engagement: '92%'
		},
		{
			id: 7,
			title: 'PlayStation 5',
			price: 599,
			image: 'https://picsum.photos/200/250?random=16',
			likes: 234,
			views: 1890,
			engagement: '95%'
		},
		{
			id: 8,
			title: 'Canon камера',
			price: 890,
			image: 'https://picsum.photos/200/250?random=17',
			likes: 67,
			views: 445,
			engagement: '87%'
		}
	];
	
	let nearbyProducts = [
		{
			id: 9,
			title: 'Велосипед Trek',
			price: 399,
			image: 'https://picsum.photos/200/250?random=18',
			distance: '0.5 км',
			location: 'кв. Лозенец',
			seller: 'Георги М.',
			rating: 4.9
		},
		{
			id: 10,
			title: 'Кафемашина',
			price: 89,
			image: 'https://picsum.photos/200/250?random=19',
			distance: '1.2 км',
			location: 'кв. Студентски',
			seller: 'Мария П.',
			rating: 4.7
		},
		{
			id: 11,
			title: 'Детска количка',
			price: 179,
			image: 'https://picsum.photos/200/250?random=20',
			distance: '2.1 км',
			location: 'кв. Младост',
			seller: 'Анна С.',
			rating: 5.0
		},
		{
			id: 12,
			title: 'Лаптоп Lenovo',
			price: 699,
			image: 'https://picsum.photos/200/250?random=21',
			distance: '3.5 км',
			location: 'кв. Витоша',
			seller: 'Петър Д.',
			rating: 4.8
		}
	];
	
	function formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}
</script>

<section class="py-12 md:py-16 bg-white">
	<div class="max-w-7xl mx-auto px-4">
		<!-- Section Header -->
		<div class="text-center mb-12">
			<h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
				Открий най-доброто
			</h2>
			<p class="text-lg text-gray-600">
				Нови обяви, популярни продукти и находки в близост до теб
			</p>
		</div>
		
		<!-- Tabs Component -->
		<Tabs.Root value={currentTab} onValueChange={(value) => currentTab = value || 'new'}>
			<!-- Tab Navigation -->
			<Tabs.List class="grid w-full grid-cols-3 mb-8 bg-gray-100 rounded-xl p-1">
				<Tabs.Trigger 
					value="new" 
					class="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<Clock size={16} />
					<span class="hidden sm:inline">Най-нови</span>
					<span class="sm:hidden">Нови</span>
				</Tabs.Trigger>
				<Tabs.Trigger 
					value="popular" 
					class="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<TrendingUp size={16} />
					<span class="hidden sm:inline">Популярни</span>
					<span class="sm:hidden">Топ</span>
				</Tabs.Trigger>
				<Tabs.Trigger 
					value="nearby" 
					class="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<MapPin size={16} />
					<span class="hidden sm:inline">В близост</span>
					<span class="sm:hidden">Близо</span>
				</Tabs.Trigger>
			</Tabs.List>
			
			<!-- New Products Content -->
			<Tabs.Content value="new" class="mt-0">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each newProducts as product}
						<a href="/products/{product.id}" class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
							<div class="relative aspect-[4/5] overflow-hidden">
								<img 
									src={product.image}
									alt={product.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
								<!-- New badge -->
								<div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
									Ново
								</div>
								<!-- Time ago -->
								<div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
									{product.timeAgo}
								</div>
							</div>
							<div class="p-3">
								<h3 class="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
									{product.title}
								</h3>
								<p class="text-lg font-bold text-gray-900 mb-2">{product.price} лв</p>
								<div class="flex items-center justify-between text-xs text-gray-500">
									<div class="flex items-center gap-1">
										<MapPin size={10} />
										<span>{product.location}</span>
									</div>
									<div class="flex items-center gap-2">
										<div class="flex items-center gap-1">
											<Heart size={10} />
											<span>{product.likes}</span>
										</div>
										<div class="flex items-center gap-1">
											<Eye size={10} />
											<span>{product.views}</span>
										</div>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-8 text-center">
					<a href="/products?sort=newest" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
						<Clock size={16} />
						Виж всички нови обяви
					</a>
				</div>
			</Tabs.Content>
			
			<!-- Popular Products Content -->
			<Tabs.Content value="popular" class="mt-0">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each popularProducts as product}
						<a href="/products/{product.id}" class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
							<div class="relative aspect-[4/5] overflow-hidden">
								<img 
									src={product.image}
									alt={product.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
								<!-- Popular badge -->
								<div class="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
									🔥 Популярно
								</div>
								<!-- Engagement -->
								<div class="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
									{product.engagement}
								</div>
							</div>
							<div class="p-3">
								<h3 class="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
									{product.title}
								</h3>
								<p class="text-lg font-bold text-gray-900 mb-2">{product.price} лв</p>
								<div class="flex items-center justify-between text-xs text-gray-500">
									<div class="flex items-center gap-2">
										<div class="flex items-center gap-1">
											<Heart size={10} />
											<span>{formatNumber(product.likes)}</span>
										</div>
										<div class="flex items-center gap-1">
											<Eye size={10} />
											<span>{formatNumber(product.views)}</span>
										</div>
									</div>
									<div class="text-orange-600 font-medium">
										Топ продукт
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-8 text-center">
					<a href="/products?sort=popular" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
						<TrendingUp size={16} />
						Виж най-популярните
					</a>
				</div>
			</Tabs.Content>
			
			<!-- Nearby Products Content -->
			<Tabs.Content value="nearby" class="mt-0">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					{#each nearbyProducts as product}
						<a href="/products/{product.id}" class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
							<div class="relative aspect-[4/5] overflow-hidden">
								<img 
									src={product.image}
									alt={product.title}
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
								<!-- Distance badge -->
								<div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
									📍 {product.distance}
								</div>
							</div>
							<div class="p-3">
								<h3 class="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
									{product.title}
								</h3>
								<p class="text-lg font-bold text-gray-900 mb-2">{product.price} лв</p>
								<div class="text-xs text-gray-500 mb-1">
									<div class="flex items-center gap-1 mb-1">
										<MapPin size={10} />
										<span>{product.location}</span>
									</div>
									<div class="flex items-center justify-between">
										<span>{product.seller}</span>
										<div class="flex items-center gap-1">
											<Star size={10} class="fill-yellow-400 text-yellow-400" />
											<span>{product.rating}</span>
										</div>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
				<div class="mt-8 text-center">
					<a href="/products?sort=nearby" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors">
						<MapPin size={16} />
						Виж всички наблизо
					</a>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</section>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>