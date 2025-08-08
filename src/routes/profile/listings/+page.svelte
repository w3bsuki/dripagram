<script lang="ts">
	import { Package, Plus, Grid3x3, List, Filter, Search } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { ProductCard } from '$lib/components/marketplace';
	
	const auth = getAuthContext();
	
	// Mock data for demonstration
	let listings = $state<any[]>([
		{
			id: '1',
			title: 'Vintage Denim Jacket',
			price: 89,
			condition: 'like_new',
			thumbnail_url: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400',
			images: ['https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'],
			like_count: 24,
			view_count: 156,
			size: 'M',
			brand: 'Levi\'s',
			tags: ['vintage', 'denim', 'streetwear'],
			created_at: new Date(Date.now() - 86400000).toISOString(),
			seller: {
				id: 'seller1',
				username: 'vintage_finds',
				avatar_url: 'https://i.pravatar.cc/150?img=1',
				verified: true
			}
		},
		{
			id: '2',
			title: 'Nike Air Max 90',
			price: 120,
			condition: 'new',
			thumbnail_url: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400',
			images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800'],
			like_count: 45,
			view_count: 289,
			size: '42',
			brand: 'Nike',
			tags: ['sneakers', 'nike', 'airmax'],
			created_at: new Date(Date.now() - 172800000).toISOString(),
			seller: {
				id: 'seller1',
				username: 'vintage_finds',
				avatar_url: 'https://i.pravatar.cc/150?img=1',
				verified: true
			}
		},
		{
			id: '3',
			title: 'Designer Leather Bag',
			price: 250,
			condition: 'good',
			original_price: 450,
			thumbnail_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
			images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
			like_count: 67,
			view_count: 412,
			brand: 'Coach',
			tags: ['bag', 'designer', 'luxury'],
			created_at: new Date(Date.now() - 259200000).toISOString(),
			seller: {
				id: 'seller1',
				username: 'vintage_finds',
				avatar_url: 'https://i.pravatar.cc/150?img=1',
				verified: true
			}
		}
	]);
	
	let loading = $state(false);
	let viewMode = $state<'grid' | 'list'>('grid');
	let sortBy = $state('newest');
	let filterStatus = $state('all');
	let searchQuery = $state('');
	
	// Stats
	let totalViews = $derived(listings.reduce((sum, item) => sum + (item.view_count || 0), 0));
	let totalLikes = $derived(listings.reduce((sum, item) => sum + (item.like_count || 0), 0));
	let activeListings = $derived(listings.filter(item => item.status !== 'sold').length);
	
	// Filtered listings
	let filteredListings = $derived(() => {
		let result = [...listings];
		
		// Search filter
		if (searchQuery) {
			result = result.filter(item => 
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}
		
		// Status filter
		if (filterStatus !== 'all') {
			result = result.filter(item => item.status === filterStatus);
		}
		
		// Sorting
		switch (sortBy) {
			case 'newest':
				result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
				break;
			case 'popular':
				result.sort((a, b) => b.like_count - a.like_count);
				break;
			case 'price-low':
				result.sort((a, b) => a.price - b.price);
				break;
			case 'price-high':
				result.sort((a, b) => b.price - a.price);
				break;
		}
		
		return result;
	});
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header Section -->
	<div class="bg-white border-b border-gray-200">
		<div class="container mx-auto max-w-7xl px-4 py-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">My Listings</h1>
					<p class="text-sm text-gray-500 mt-1">Manage and track your products</p>
				</div>
				<Button 
					onclick={() => goto('/sell')}
					class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
				>
					<Plus size={18} />
					New Listing
				</Button>
			</div>
			
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
							<p class="text-2xl font-bold text-gray-900 mt-1">{activeListings}</p>
						</div>
						<div class="bg-blue-100 p-2 rounded-lg">
							<Package size={20} class="text-blue-600" />
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Views</p>
							<p class="text-2xl font-bold text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
						</div>
						<div class="bg-green-100 p-2 rounded-lg">
							<svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Likes</p>
							<p class="text-2xl font-bold text-gray-900 mt-1">{totalLikes.toLocaleString()}</p>
						</div>
						<div class="bg-red-100 p-2 rounded-lg">
							<svg class="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
							</svg>
						</div>
					</div>
				</div>
				
				<div class="bg-white rounded-lg border border-gray-200 p-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</p>
							<p class="text-2xl font-bold text-gray-900 mt-1">$0</p>
						</div>
						<div class="bg-purple-100 p-2 rounded-lg">
							<svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Filters and Controls -->
	<div class="bg-white border-b border-gray-200 sticky top-0 z-10">
		<div class="container mx-auto max-w-7xl px-4 py-4">
			<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
				<!-- Search Bar -->
				<div class="relative flex-1 max-w-md">
					<Search size={18} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search your listings..."
						class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
					/>
				</div>
				
				<!-- Controls -->
				<div class="flex items-center gap-3">
					<!-- Status Filter -->
					<select 
						bind:value={filterStatus}
						class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="sold">Sold</option>
						<option value="draft">Draft</option>
					</select>
					
					<!-- Sort Dropdown -->
					<select 
						bind:value={sortBy}
						class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="newest">Newest First</option>
						<option value="popular">Most Popular</option>
						<option value="price-low">Price: Low to High</option>
						<option value="price-high">Price: High to Low</option>
					</select>
					
					<!-- View Mode Toggle -->
					<div class="flex items-center bg-gray-100 rounded-lg p-1">
						<button
							onclick={() => viewMode = 'grid'}
							class="p-2 rounded {viewMode === 'grid' ? 'bg-white shadow-sm' : ''} transition-all"
							aria-label="Grid view"
						>
							<Grid3x3 size={18} class={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'} />
						</button>
						<button
							onclick={() => viewMode = 'list'}
							class="p-2 rounded {viewMode === 'list' ? 'bg-white shadow-sm' : ''} transition-all"
							aria-label="List view"
						>
							<List size={18} class={viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'} />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Main Content -->
	<div class="container mx-auto max-w-7xl px-4 py-8">
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
			</div>
		{:else if filteredListings().length === 0}
			<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
				<div class="max-w-md mx-auto">
					<div class="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
						<Package size={32} class="text-gray-400" />
					</div>
					<h2 class="mb-2 text-xl font-semibold text-gray-900">
						{searchQuery ? 'No listings found' : 'No listings yet'}
					</h2>
					<p class="mb-6 text-gray-500">
						{searchQuery 
							? 'Try adjusting your search or filters' 
							: 'Start selling your items today and reach thousands of buyers!'
						}
					</p>
					{#if !searchQuery}
						<Button 
							onclick={() => goto('/sell')}
							class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
						>
							Create Your First Listing
						</Button>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Product Grid/List -->
			{#if viewMode === 'grid'}
				<div class="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
					{#each filteredListings() as listing}
						<ProductCard product={listing} />
					{/each}
				</div>
			{:else}
				<!-- List View -->
				<div class="space-y-4">
					{#each filteredListings() as listing}
						<div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
							<div class="flex gap-4">
								<img 
									src={listing.thumbnail_url} 
									alt={listing.title}
									class="w-24 h-24 object-cover rounded-lg"
								/>
								<div class="flex-1">
									<div class="flex items-start justify-between">
										<div>
											<h3 class="font-semibold text-gray-900">{listing.title}</h3>
											<p class="text-sm text-gray-500 mt-1">
												{listing.brand || ''} • Size {listing.size || 'N/A'}
											</p>
										</div>
										<div class="text-right">
											<p class="text-lg font-bold text-gray-900">${listing.price}</p>
											{#if listing.original_price && listing.original_price > listing.price}
												<p class="text-sm text-gray-500 line-through">${listing.original_price}</p>
											{/if}
										</div>
									</div>
									<div class="flex items-center gap-4 mt-3 text-sm text-gray-500">
										<span class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
												<path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
											</svg>
											{listing.like_count} likes
										</span>
										<span class="flex items-center gap-1">
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
											{listing.view_count} views
										</span>
										<span class="ml-auto">
											<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												{listing.condition === 'new' ? 'New' : listing.condition === 'like_new' ? 'Like New' : 'Good'}
											</span>
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* Professional hover effects */
	:global(.bg-white:hover) {
		transition: all 0.2s ease;
	}
	
	/* Smooth transitions */
	select, input, button {
		transition: all 0.2s ease;
	}
</style>