<script lang="ts">
	import { Search, X, ChevronDown } from '@lucide/svelte';
	
	interface Props {
		searchQuery: string;
		showSearchDropdown: boolean;
		onSearchChange: (query: string) => void;
		onSearchFocus: () => void;
		onSearchBlur: () => void;
		onSearchSubmit: () => void;
	}
	
	let {
		searchQuery = $bindable(),
		showSearchDropdown = $bindable(),
		onSearchChange,
		onSearchFocus,
		onSearchBlur,
		onSearchSubmit
	}: Props = $props();
	
	const trendingSearches = [
		'Vintage jeans',
		'Designer bags',
		'Sneakers',
		'Summer dresses',
		'Vintage t-shirts'
	];
	
	function handleTrendingClick(term: string) {
		searchQuery = term;
		onSearchChange(term);
		showSearchDropdown = false;
		onSearchSubmit();
	}
	
	function clearSearch() {
		searchQuery = '';
		onSearchChange('');
	}
</script>

<div class="search-container">
	<div class="search-wrapper">
		<Search size={20} class="search-icon" />
		<input
			type="text"
			placeholder="Search for items..."
			class="search-input"
			bind:value={searchQuery}
			oninput={(e) => onSearchChange(e.currentTarget.value)}
			onfocus={onSearchFocus}
			onblur={() => setTimeout(onSearchBlur, 150)}
			onkeydown={(e) => e.key === 'Enter' && onSearchSubmit()}
		/>
		{#if searchQuery}
			<button class="clear-search" onclick={clearSearch} aria-label="Clear search">
				<X size={16} />
			</button>
		{/if}
	</div>
	
	{#if showSearchDropdown}
		<div class="search-dropdown">
			<div class="trending-section">
				<h4>Trending Searches</h4>
				<div class="trending-list">
					{#each trendingSearches as term}
						<button 
							class="trending-item"
							onclick={() => handleTrendingClick(term)}
						>
							{term}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.search-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}
	
	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: white;
		border: 2px solid var(--color-border-primary);
		border-radius: 12px;
		padding: 0.75rem 1rem;
		transition: all 0.15s;
	}
	
	.search-wrapper:focus-within {
		border-color: var(--color-interactive-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	.search-icon {
		color: var(--color-text-secondary);
		margin-right: 0.75rem;
		flex-shrink: 0;
	}
	
	.search-input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 1rem;
		background: transparent;
		color: var(--color-text-primary);
	}
	
	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}
	
	.clear-search {
		padding: 0.25rem;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}
	
	.clear-search:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}
	
	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid var(--color-border-primary);
		border-radius: 12px;
		margin-top: 0.5rem;
		box-shadow: var(--shadow-lg);
		z-index: var(--z-high);
		overflow: hidden;
	}
	
	.trending-section {
		padding: 1rem;
	}
	
	.trending-section h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}
	
	.trending-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	
	.trending-item {
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		text-align: left;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 8px;
		font-size: 0.875rem;
		transition: all 0.15s;
	}
	
	.trending-item:hover {
		background: var(--color-surface-tertiary);
		color: var(--color-text-primary);
	}
</style>