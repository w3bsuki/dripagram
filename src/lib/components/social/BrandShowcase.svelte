<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Check } from '@lucide/svelte';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { createClient } from '$lib/supabase/client';
	import { goto } from '$app/navigation';

	interface Brand {
		id: string;
		username: string;
		brand_name: string;
		brand_logo_url: string;
		brand_category: string;
		follower_count: number;
		listing_count: number;
		isFollowing?: boolean;
	}

	let brands = $state<Brand[]>([]);
	let selectedBrand = $state<Brand | null>(null);
	let loading = $state(true);
	
	// Get auth context
	let auth: ReturnType<typeof getAuthContext> | null = null;
	try {
		auth = getAuthContext();
	} catch {
		// Context not available
		auth = null;
	}
	
	const supabase = createClient();

	onMount(async () => {
		await loadBrands();
	});

	async function loadBrands() {
		try {
			const { data, error } = await supabase.rpc('get_verified_brands', { limit_count: 10 });

			if (error) throw error;

			if (!data || data.length === 0) {
				brands = getDemoBrands();
			} else {
				brands = data;
			}
		} catch (error) {
			console.error('Error loading brands:', error);
			brands = getDemoBrands();
		} finally {
			loading = false;
		}
	}

	function getDemoBrands(): Brand[] {
		return [
			{
				id: '1',
				username: 'nike_bulgaria',
				brand_name: 'Nike Bulgaria',
				brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
				brand_category: 'Sportswear',
				follower_count: 15234,
				listing_count: 89,
			},
			{
				id: '2',
				username: 'zara_bg',
				brand_name: 'Zara',
				brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/05/Zara-Logo.png',
				brand_category: 'Fashion',
				follower_count: 12890,
				listing_count: 156,
			},
			{
				id: '3',
				username: 'hm_bulgaria',
				brand_name: 'H&M',
				brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png',
				brand_category: 'Fashion',
				follower_count: 9876,
				listing_count: 234,
			},
			{
				id: '4',
				username: 'adidas_bg',
				brand_name: 'Adidas Bulgaria',
				brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
				brand_category: 'Sportswear',
				follower_count: 8765,
				listing_count: 67,
			},
			{
				id: '5',
				username: 'reserved_bg',
				brand_name: 'Reserved',
				brand_logo_url:
					'https://i.pinimg.com/originals/5e/4e/0d/5e4e0d6f4c8c6a6b8e6c8e6c8e6c8e6c.jpg',
				brand_category: 'Fashion',
				follower_count: 6543,
				listing_count: 123,
			},
			{
				id: '6',
				username: 'mango_bulgaria',
				brand_name: 'Mango',
				brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/12/Mango-Logo.png',
				brand_category: 'Fashion',
				follower_count: 5432,
				listing_count: 98,
			},
		];
	}

	function openBrand(brand: Brand) {
		selectedBrand = brand;
	}

	function closeBrandModal() {
		selectedBrand = null;
	}

	function navigateToBrand(brand: Brand) {
		goto(`/@${brand.username}`);
	}

	function formatFollowers(count: number): string {
		if (count >= 1000) {
			return `${(count / 1000).toFixed(1)}k`;
		}
		return count.toString();
	}
</script>

{#snippet brandAvatar(brand: Brand & { isVerified?: boolean })}
	<div class="flex flex-col items-center gap-2">
		<div class="relative">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300 bg-white transition-all group-hover:border-gray-900"
			>
				<img src={brand.brand_logo_url} alt={brand.brand_name} class="h-12 w-12 object-contain" />
			</div>
			<span
				class="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white ring-2 ring-white"
			>
				{#if brand.isVerified}
					<Check size={10} strokeWidth={3} />
				{:else}
					<Plus size={12} strokeWidth={3} />
				{/if}
			</span>
		</div>
		<span class="w-16 truncate text-center text-[11px] font-semibold text-gray-900"
			>{brand.brand_name}</span
		>
	</div>
{/snippet}

<div class="border-b border-gray-200 bg-white py-3">
	<div class="scrollbar-hide flex gap-4 overflow-x-auto px-4">
		{#if auth?.user?.user_metadata?.account_type === 'brand'}
			{@const brandItem = {
				id: auth?.user?.id || '',
				username: auth?.user?.user_metadata?.username || 'your-brand',
				brand_logo_url:
					auth?.user?.user_metadata?.brand_logo_url ||
					'https://ui-avatars.com/api/?name=Your+Brand&background=3b82f6&color=fff',
				brand_name: 'Your Brand',
				brand_category: auth?.user?.user_metadata?.brand_category || 'Fashion',
				follower_count: 0,
				listing_count: 0,
				isVerified: false,
			}}
			<button class="group flex-shrink-0" onclick={() => goto('/dashboard')}>
				{@render brandAvatar(brandItem)}
			</button>
		{/if}

		{#if loading}
			{#each Array(5) as _}
				<div class="flex flex-shrink-0 flex-col items-center gap-2">
					<div class="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
					<div class="h-2 w-12 animate-pulse rounded bg-gray-200" />
				</div>
			{/each}
		{:else}
			{#each brands as brand (brand.id)}
				<button class="group flex-shrink-0" onclick={() => openBrand(brand)}>
					{@render brandAvatar({ ...brand, isVerified: true })}
				</button>
			{/each}
		{/if}
	</div>
</div>

{#if selectedBrand}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		onclick={closeBrandModal}
	>
		<div
			class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center gap-4 border-b border-gray-100 p-6">
				<img
					src={selectedBrand.brand_logo_url}
					alt={selectedBrand.brand_name}
					class="h-14 w-14 rounded-xl border border-gray-200 bg-gray-50 object-cover p-2"
				/>
				<div class="flex-1">
					<h2 class="text-xl font-bold text-gray-900">
						{selectedBrand.brand_name}
					</h2>
					<p class="text-sm text-gray-500">
						@{selectedBrand.username}
					</p>
				</div>
				<button
					class="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
					onclick={closeBrandModal}
				>
					<span class="text-2xl leading-none">×</span>
				</button>
			</div>

			<div class="grid grid-cols-3 gap-4 border-b border-gray-100 p-6">
				<div class="text-center">
					<span class="block text-2xl font-bold text-gray-900">
						{selectedBrand.listing_count}
					</span>
					<span class="mt-1 block text-xs text-gray-500"> Products </span>
				</div>
				<div class="text-center">
					<span class="block text-2xl font-bold text-gray-900">
						{formatFollowers(selectedBrand.follower_count)}
					</span>
					<span class="mt-1 block text-xs text-gray-500"> Followers </span>
				</div>
				<div class="text-center">
					<span class="block text-lg font-bold text-gray-900">
						{selectedBrand.brand_category}
					</span>
					<span class="mt-1 block text-xs text-gray-500"> Category </span>
				</div>
			</div>

			<div class="flex gap-3 p-6">
				<button
					class="flex-1 rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600"
					onclick={() => selectedBrand && navigateToBrand(selectedBrand)}
				>
					View Shop
				</button>
				<button
					class="flex-1 rounded-lg bg-gray-100 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-200"
				>
					{selectedBrand.isFollowing ? 'Following' : 'Follow'}
				</button>
			</div>
		</div>
	</div>
{/if}
