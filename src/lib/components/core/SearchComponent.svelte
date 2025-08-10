<script lang="ts">
	import { Search, Camera, MapPin } from '@lucide/svelte';
	import Button from '$lib/components/ui/button';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import SearchModal from './SearchModal.svelte';
	import { goto } from '$app/navigation';

	let {
		variant = 'hero', // 'hero' | 'header'
		showLocation = false,
		class: className = '',
	} = $props();

	let searchModalOpen = $state(false);
	let locationOpen = $state(false);
	let selectedLocation = $state('София');
	let searchQuery = $state('');

	// Location suggestions
	let locations = [
		{ name: 'София', region: 'София-град' },
		{ name: 'Пловдив', region: 'Пловдивска област' },
		{ name: 'Варна', region: 'Варненска област' },
		{ name: 'Бургас', region: 'Бургаска област' },
		{ name: 'Русе', region: 'Русенска област' },
		{ name: 'Стара Загора', region: 'Старозагорска област' },
	];

	function openSearchModal() {
		searchModalOpen = true;
	}

	function selectLocation(location: string) {
		selectedLocation = location;
		locationOpen = false;
	}

	function handleQuickSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/browse?q=${encodeURIComponent(searchQuery)}`);
			searchQuery = '';
		}
	}

	// Keyboard navigation for location dropdown
	function handleLocationKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			locationOpen = !locationOpen;
		}
	}
</script>

{#if variant === 'hero'}
	<!-- Hero Search - Full featured with location -->
	<div
		class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-lg {className}"
	>
		<div class="flex flex-col gap-4 md:flex-row">
			<div class="flex-1">
				<Button
					variant="outline"
					onclick={openSearchModal}
					class="text-muted-foreground bg-muted hover:bg-muted/80 h-12 w-full justify-start"
				>
					<Search size={20} class="mr-3" />
					<span class="flex-1 text-left">Търси продукти, марки, категории...</span>
				</Button>
			</div>

			{#if showLocation}
				<!-- Location Selector -->
				<Popover.Root bind:open={locationOpen}>
					<Popover.Trigger>
						<Button
							variant="outline"
							class="bg-muted hover:bg-muted/80 min-w-fit gap-2"
							onkeydown={handleLocationKeydown}
						>
							<MapPin size={16} />
							<span class="whitespace-nowrap">{selectedLocation}</span>
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-80 p-0" align="end">
						<div class="border-border border-b p-4">
							<h3 class="text-foreground font-semibold">Избери местоположение</h3>
							<p class="text-muted-foreground text-sm">Виж продукти в близост до теб</p>
						</div>
						<div class="max-h-64 overflow-y-auto p-2">
							{#each locations as location}
								<button
									onclick={() => selectLocation(location.name)}
									class="hover:bg-muted w-full rounded-lg px-3 py-2 text-left transition-colors"
								>
									<div class="text-foreground font-medium">{location.name}</div>
									<div class="text-muted-foreground text-xs">{location.region}</div>
								</button>
							{/each}
						</div>
					</Popover.Content>
				</Popover.Root>
			{/if}
		</div>
	</div>
{:else if variant === 'header'}
	<!-- Header Search - Compact inline search -->
	<form onsubmit={handleQuickSearch} class="flex items-center gap-2 {className}">
		<div class="relative flex-1">
			<Search size={20} class="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />
			<Input
				bind:value={searchQuery}
				placeholder="Търси..."
				class="bg-muted h-10 rounded-full border-0 pr-12 pl-10"
			/>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
				onclick={openSearchModal}
			>
				<Camera size={16} />
				<span class="sr-only">Разширено търсене</span>
			</Button>
		</div>
	</form>
{/if}

<!-- Search Modal (shared by both variants) -->
<SearchModal bind:open={searchModalOpen} />
