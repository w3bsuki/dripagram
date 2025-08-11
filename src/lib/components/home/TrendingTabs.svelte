<script lang="ts">
	import { Clock, TrendingUp, MapPin, Heart, Eye, Star } from '@lucide/svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { FeedProduct } from '$lib/types';

	interface Props {
		newProducts?: FeedProduct[];
		popularProducts?: FeedProduct[];
		nearbyProducts?: FeedProduct[];
	}

	let {
		newProducts = [],
		popularProducts = [],
		nearbyProducts = []
	}: Props = $props();

	let currentTab = $state('new');


	function formatNumber(num: number): string {
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}
</script>

<section class="bg-white py-12 md:py-16">
	<div class="mx-auto max-w-7xl px-4">
		<!-- Section Header -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">Открий най-доброто</h2>
			<p class="text-lg text-gray-600">Нови обяви, популярни продукти и находки в близост до теб</p>
		</div>

		<!-- Tabs Component -->
		<Tabs.Root value={currentTab} onValueChange={(value) => (currentTab = value || 'new')}>
			<!-- Tab Navigation -->
			<Tabs.List class="mb-8 grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1">
				<Tabs.Trigger
					value="new"
					class="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<Clock size={16} />
					<span class="hidden sm:inline">Най-нови</span>
					<span class="sm:hidden">Нови</span>
				</Tabs.Trigger>
				<Tabs.Trigger
					value="popular"
					class="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<TrendingUp size={16} />
					<span class="hidden sm:inline">Популярни</span>
					<span class="sm:hidden">Топ</span>
				</Tabs.Trigger>
				<Tabs.Trigger
					value="nearby"
					class="flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
				>
					<MapPin size={16} />
					<span class="hidden sm:inline">В близост</span>
					<span class="sm:hidden">Близо</span>
				</Tabs.Trigger>
			</Tabs.List>

			<!-- New Products Content -->
			<Tabs.Content value="new" class="mt-0">
				{#if newProducts.length === 0}
					<div class="text-center py-12 text-gray-500">
						<p>Няма нови продукти в момента.</p>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
						{#each newProducts as product}
							<a
								href="/products/{product.id}"
								class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
							>
								<div class="relative aspect-[4/5] overflow-hidden">
									<img
										src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'}
										alt={product.title}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>
									<!-- New badge -->
									<div
										class="absolute top-2 left-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white"
									>
										Ново
									</div>
									<!-- Time ago based on created_at -->
									<div
										class="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
									>
										{new Date(product.created_at).toLocaleDateString('bg-BG')}
									</div>
								</div>
								<div class="p-3">
									<h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
										{product.title}
									</h3>
									<p class="mb-2 text-lg font-bold text-gray-900">{product.price} лв</p>
									<div class="flex items-center justify-between text-xs text-gray-500">
										{#if product.location}
											<div class="flex items-center gap-1">
												<MapPin size={10} />
												<span>{product.location}</span>
											</div>
										{/if}
										<div class="flex items-center gap-2">
											{#if product.likes_count}
												<div class="flex items-center gap-1">
													<Heart size={10} />
													<span>{product.likes_count}</span>
												</div>
											{/if}
											{#if product.views}
												<div class="flex items-center gap-1">
													<Eye size={10} />
													<span>{product.views}</span>
												</div>
											{/if}
										</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
				<div class="mt-8 text-center">
					<a
						href="/products?sort=newest"
						class="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-colors"
					>
						<Clock size={16} />
						Виж всички нови обяви
					</a>
				</div>
			</Tabs.Content>

			<!-- Popular Products Content -->
			<Tabs.Content value="popular" class="mt-0">
				{#if popularProducts.length === 0}
					<div class="text-center py-12 text-gray-500">
						<p>Няма популярни продукти в момента.</p>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
						{#each popularProducts as product}
							<a
								href="/products/{product.id}"
								class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
							>
								<div class="relative aspect-[4/5] overflow-hidden">
									<img
										src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'}
										alt={product.title}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>
									<!-- Popular badge -->
									<div
										class="absolute top-2 left-2 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white"
									>
										🔥 Популярно
									</div>
									<!-- Views/Likes info -->
									{#if product.views || product.likes_count}
										<div
											class="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm"
										>
											{product.views || product.likes_count || 0}
										</div>
									{/if}
								</div>
								<div class="p-3">
									<h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
										{product.title}
									</h3>
									<p class="mb-2 text-lg font-bold text-gray-900">{product.price} лв</p>
									<div class="flex items-center justify-between text-xs text-gray-500">
										<div class="flex items-center gap-2">
											{#if product.likes_count}
												<div class="flex items-center gap-1">
													<Heart size={10} />
													<span>{formatNumber(product.likes_count)}</span>
												</div>
											{/if}
											{#if product.views}
												<div class="flex items-center gap-1">
													<Eye size={10} />
													<span>{formatNumber(product.views)}</span>
												</div>
											{/if}
										</div>
										<div class="font-medium text-orange-600">Топ продукт</div>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
				<div class="mt-8 text-center">
					<a
						href="/products?sort=popular"
						class="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-colors"
					>
						<TrendingUp size={16} />
						Виж най-популярните
					</a>
				</div>
			</Tabs.Content>

			<!-- Nearby Products Content -->
			<Tabs.Content value="nearby" class="mt-0">
				{#if nearbyProducts.length === 0}
					<div class="text-center py-12 text-gray-500">
						<p>Няма продукти в близост в момента.</p>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
						{#each nearbyProducts as product}
							<a
								href="/products/{product.id}"
								class="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg"
							>
								<div class="relative aspect-[4/5] overflow-hidden">
									<img
										src={product.thumbnail_url || product.images?.[0] || '/placeholder.jpg'}
										alt={product.title}
										class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
										loading="lazy"
									/>
									<!-- Location badge -->
									<div
										class="absolute top-2 left-2 rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white"
									>
										📍 Близо
									</div>
								</div>
								<div class="p-3">
									<h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">
										{product.title}
									</h3>
									<p class="mb-2 text-lg font-bold text-gray-900">{product.price} лв</p>
									<div class="mb-1 text-xs text-gray-500">
										{#if product.location}
											<div class="mb-1 flex items-center gap-1">
												<MapPin size={10} />
												<span>{product.location}</span>
											</div>
										{/if}
										{#if product.seller}
											<div class="flex items-center justify-between">
												<span>{product.seller.username || 'User'}</span>
												{#if product.seller.rating}
													<div class="flex items-center gap-1">
														<Star size={10} class="fill-yellow-400 text-yellow-400" />
														<span>{product.seller.rating.toFixed(1)}</span>
													</div>
												{/if}
											</div>
										{/if}
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
				<div class="mt-8 text-center">
					<a
						href="/products?sort=nearby"
						class="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-colors"
					>
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
