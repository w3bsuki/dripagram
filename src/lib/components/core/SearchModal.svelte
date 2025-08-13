<script lang="ts">
	import { Search, Camera, TrendingUp, MapPin } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Button from '$lib/components/native/Button.svelte';
	import Input from '$lib/components/native/Input.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { goto } from '$app/navigation';

	let { open = $bindable() } = $props();

	let searchValue = $state('');
	let selectedLocation = $state('София');

	// Sample trending searches
	let trendingSearches = [
		'iPhone 15 Pro',
		'Nike Air Max',
		'Zara яке',
		'PlayStation 5',
		'Зимни обувки',
	];

	let recentSearches: string[] = [];

	// Categories with emojis
	let categories = [
		{ emoji: '👗', name: 'Дамски дрехи', query: 'дамски дрехи' },
		{ emoji: '👔', name: 'Мъжки дрехи', query: 'мъжки дрехи' },
		{ emoji: '👟', name: 'Обувки', query: 'обувки' },
		{ emoji: '📱', name: 'Електроника', query: 'електроника' },
		{ emoji: '💄', name: 'Красота', query: 'красота' },
		{ emoji: '🏠', name: 'Дом и градина', query: 'дом' },
	];

	function handleSearch(query: string) {
		if (query.trim()) {
			goto(`/browse?q=${encodeURIComponent(query)}`);
			open = false;
			searchValue = '';
		}
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (searchValue.trim()) {
			handleSearch(searchValue);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[80vh] max-w-2xl overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Търсене</Dialog.Title>
			<Dialog.Description>Търси продукти, марки, категории или потребители</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-6">
			<!-- Search Input -->
			<form onsubmit={handleSubmit}>
				<div class="relative">
					<Search size={20} class="text-muted-foreground absolute top-3 left-3" />
					<Input
						bind:value={searchValue}
						placeholder="Търси продукти, марки, категории..."
						class="h-12 pr-12 pl-10 text-lg"
						autofocus
						onkeydown={handleKeydown}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class="absolute top-1 right-1 h-10 w-10"
						onclick={() => {
						}}
					>
						<Camera size={20} />
						<span class="sr-only">Визуално търсене</span>
					</Button>
				</div>
			</form>

			<!-- Recent Searches -->
			{#if searchValue === '' && recentSearches.length > 0}
				<div>
					<h3 class="text-foreground mb-3 text-sm font-medium">Скорошни търсения</h3>
					<div class="space-y-1">
						{#each recentSearches as search}
							<button
								onclick={() => handleSearch(search)}
								class="hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
							>
								<Search size={16} class="text-muted-foreground" />
								<span class="flex-1">{search}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Trending Searches -->
			{#if searchValue === ''}
				<div>
					<h3 class="text-foreground mb-3 text-sm font-medium">🔥 Популярни търсения</h3>
					<div class="flex flex-wrap gap-2">
						{#each trendingSearches as search}
							<Badge
								variant="secondary"
								class="hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
								onclick={() => handleSearch(search)}
							>
								{search}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Categories -->
			<div>
				<h3 class="text-foreground mb-3 text-sm font-medium">Категории</h3>
				<div class="grid grid-cols-2 gap-2">
					{#each categories as category}
						<button
							onclick={() => handleSearch(category.query)}
							class="hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
						>
							<span class="text-lg">{category.emoji}</span>
							<span class="text-sm">{category.name}</span>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
