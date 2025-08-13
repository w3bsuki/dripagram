<script lang="ts">
	import { Search, Mic, TrendingUp, Clock, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import * as m from '$lib/paraglide/messages';

	interface SearchSuggestion {
		id: string;
		text: string;
		type: 'trending' | 'recent' | 'category' | 'brand';
		emoji?: string;
		count?: number;
	}

	let {
		searchQuery = '',
		onSearch,
		onFocus,
		placeholder = 'Search items or @sellers'
	}: {
		searchQuery?: string;
		onSearch: (query: string) => void;
		onFocus?: () => void;
		placeholder?: string;
	} = $props();

	// Component state
	let showDropdown = $state(false);
	let inputFocused = $state(false);
	let suggestions = $state<SearchSuggestion[]>([]);
	let recentSearches = $state<string[]>([]);
	let isVoiceSupported = $state(false);
	let isListening = $state(false);

	// Element references
	let inputEl = $state<HTMLInputElement | null>(null);
	let dropdownEl = $state<HTMLDivElement | null>(null);
	let searchContainerEl = $state<HTMLDivElement | null>(null);

	// Trending suggestions (could be fetched from API)
	const trendingQueries = [
		{ id: 'vintage-dresses', text: 'Vintage dresses', type: 'trending', emoji: '👗', count: 234 },
		{ id: 'nike-sneakers', text: 'Nike sneakers', type: 'trending', emoji: '👟', count: 189 },
		{ id: 'designer-bags', text: 'Designer bags', type: 'trending', emoji: '👜', count: 156 },
		{ id: 'summer-sale', text: 'Summer sale', type: 'trending', emoji: '🌞', count: 134 },
		{ id: 'zara-jackets', text: 'Zara jackets', type: 'trending', emoji: '🧥', count: 98 }
	] as SearchSuggestion[];

	// Category suggestions
	const categoryQueries = [
		{ id: 'cat-men', text: 'Men\'s clothing', type: 'category', emoji: '👨' },
		{ id: 'cat-women', text: 'Women\'s clothing', type: 'category', emoji: '👩' },
		{ id: 'cat-shoes', text: 'Shoes', type: 'category', emoji: '👟' },
		{ id: 'cat-accessories', text: 'Accessories', type: 'category', emoji: '💍' }
	] as SearchSuggestion[];

	// Brand suggestions
	const brandQueries = [
		{ id: 'brand-nike', text: 'Nike', type: 'brand', emoji: '✓' },
		{ id: 'brand-adidas', text: 'Adidas', type: 'brand', emoji: '✓' },
		{ id: 'brand-zara', text: 'Zara', type: 'brand', emoji: '✓' },
		{ id: 'brand-hm', text: 'H&M', type: 'brand', emoji: '✓' }
	] as SearchSuggestion[];

	// Debounced search function
	let searchTimeout: number | null = null;
	function handleInputChange() {
		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Show dropdown when typing
		if (searchQuery.length > 0) {
			showDropdown = true;
			
			// Debounced search suggestions
			searchTimeout = setTimeout(() => {
				updateSuggestions();
			}, 300) as unknown as number;
		} else {
			// Show trending/recent when empty
			showDropdown = inputFocused;
			suggestions = getDefaultSuggestions();
		}
	}

	function updateSuggestions() {
		if (!searchQuery.trim()) {
			suggestions = getDefaultSuggestions();
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered: SearchSuggestion[] = [];

		// Add matching trending queries
		const matchingTrending = trendingQueries.filter(item => 
			item.text.toLowerCase().includes(query)
		).slice(0, 3);
		filtered.push(...matchingTrending);

		// Add matching categories
		const matchingCategories = categoryQueries.filter(item => 
			item.text.toLowerCase().includes(query)
		).slice(0, 2);
		filtered.push(...matchingCategories);

		// Add matching brands
		const matchingBrands = brandQueries.filter(item => 
			item.text.toLowerCase().includes(query)
		).slice(0, 2);
		filtered.push(...matchingBrands);

		suggestions = filtered.slice(0, 6); // Limit to 6 suggestions
	}

	function getDefaultSuggestions(): SearchSuggestion[] {
		const defaultSuggestions: SearchSuggestion[] = [];
		
		// Add recent searches
		const recentSuggestions = recentSearches.slice(0, 3).map(search => ({
			id: `recent-${search}`,
			text: search,
			type: 'recent' as const
		}));
		defaultSuggestions.push(...recentSuggestions);

		// Add trending queries
		defaultSuggestions.push(...trendingQueries.slice(0, 4));

		return defaultSuggestions.slice(0, 6);
	}

	function handleInputFocus() {
		inputFocused = true;
		showDropdown = true;
		if (suggestions.length === 0) {
			suggestions = getDefaultSuggestions();
		}
		onFocus?.();
	}

	function handleInputBlur() {
		inputFocused = false;
		// Delay hiding dropdown to allow for clicks
		setTimeout(() => {
			if (!inputFocused) {
				showDropdown = false;
			}
		}, 150);
	}

	function handleSuggestionClick(suggestion: SearchSuggestion) {
		searchQuery = suggestion.text;
		addToRecentSearches(suggestion.text);
		onSearch(suggestion.text);
		showDropdown = false;
		inputEl?.blur();
	}

	function handleSearchSubmit(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			addToRecentSearches(searchQuery.trim());
			onSearch(searchQuery.trim());
			showDropdown = false;
			inputEl?.blur();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showDropdown = false;
			inputEl?.blur();
		}
		// TODO: Add arrow key navigation for suggestions
	}

	function clearSearch() {
		searchQuery = '';
		suggestions = getDefaultSuggestions();
		inputEl?.focus();
	}

	function addToRecentSearches(query: string) {
		if (!browser) return;
		
		const recent = getRecentSearches();
		// Remove if already exists and add to front
		const filtered = recent.filter(q => q !== query);
		const updated = [query, ...filtered].slice(0, 5); // Keep only 5 recent searches
		
		localStorage.setItem('recent-searches', JSON.stringify(updated));
		recentSearches = updated;
	}

	function getRecentSearches(): string[] {
		if (!browser) return [];
		try {
			const stored = localStorage.getItem('recent-searches');
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	}

	function clearRecentSearches() {
		if (!browser) return;
		localStorage.removeItem('recent-searches');
		recentSearches = [];
		suggestions = getDefaultSuggestions();
	}

	// Voice search functionality (progressive enhancement)
	function initVoiceSearch() {
		if (!browser) return;
		isVoiceSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
	}

	function startVoiceSearch() {
		if (!isVoiceSupported || isListening) return;

		// @ts-ignore
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		const recognition = new SpeechRecognition();
		
		recognition.continuous = false;
		recognition.interimResults = false;
		recognition.lang = 'bg-BG'; // Bulgarian first, could fallback to 'en-US'

		recognition.onstart = () => {
			isListening = true;
		};

		recognition.onresult = (event: any) => {
			const transcript = event.results[0][0].transcript;
			searchQuery = transcript;
			handleInputChange();
			onSearch(transcript);
		};

		recognition.onerror = () => {
			isListening = false;
		};

		recognition.onend = () => {
			isListening = false;
		};

		recognition.start();
	}

	// Close dropdown when clicking outside
	function handleDocumentClick(event: Event) {
		const target = event.target as Element;
		
		if (showDropdown) {
			const isInsideContainer = searchContainerEl?.contains(target);
			const isInsideDropdown = dropdownEl?.contains(target);
			
			if (!isInsideContainer && !isInsideDropdown) {
				showDropdown = false;
			}
		}
	}

	// Initialize component
	onMount(() => {
		if (browser) {
			recentSearches = getRecentSearches();
			initVoiceSearch();
			
			document.addEventListener('click', handleDocumentClick);
			return () => {
				document.removeEventListener('click', handleDocumentClick);
			};
		}
	});

	// Watch for external searchQuery changes
	$effect(() => {
		handleInputChange();
	});
</script>

<div class="search-bar" bind:this={searchContainerEl}>
	<form class="search-form" onsubmit={handleSearchSubmit}>
		<div class="search-input-group {inputFocused ? 'focused' : ''}">
			<Search size={18} class="search-icon" />
			
			<input
				bind:this={inputEl}
				bind:value={searchQuery}
				type="search"
				{placeholder}
				class="search-input"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				onfocus={handleInputFocus}
				onblur={handleInputBlur}
				oninput={handleInputChange}
				onkeydown={handleKeyDown}
			/>

			{#if searchQuery.length > 0}
				<button 
					type="button" 
					class="clear-button"
					onclick={clearSearch}
					aria-label="Clear search"
				>
					<X size={16} />
				</button>
			{/if}

			{#if isVoiceSupported}
				<button
					type="button"
					class="voice-button {isListening ? 'listening' : ''}"
					onclick={startVoiceSearch}
					disabled={isListening}
					aria-label="Voice search"
				>
					<Mic size={16} />
				</button>
			{/if}
		</div>
	</form>

	<!-- Search Dropdown -->
	{#if showDropdown && suggestions.length > 0}
		<div 
			bind:this={dropdownEl}
			class="search-dropdown"
			role="listbox"
			aria-label="Search suggestions"
		>
			<div class="dropdown-content">
				<!-- Recent searches header -->
				{#if recentSearches.length > 0 && !searchQuery}
					<div class="dropdown-section">
						<div class="section-header">
							<h3 class="section-title">
								<Clock size={14} />
								Recent searches
							</h3>
							<button 
								class="clear-recent-btn"
								onclick={clearRecentSearches}
								type="button"
							>
								Clear
							</button>
						</div>
					</div>
				{/if}

				<!-- Trending header -->
				{#if !searchQuery && suggestions.some(s => s.type === 'trending')}
					<div class="dropdown-section">
						<h3 class="section-title">
							<TrendingUp size={14} />
							Trending now
						</h3>
					</div>
				{/if}

				<!-- Suggestions -->
				<div class="suggestions-list">
					{#each suggestions as suggestion}
						<button
							class="suggestion-item {suggestion.type}"
							onclick={() => handleSuggestionClick(suggestion)}
							role="option"
							type="button"
						>
							<div class="suggestion-icon">
								{#if suggestion.type === 'recent'}
									<Clock size={16} />
								{:else if suggestion.type === 'trending'}
									<span class="trending-emoji">{suggestion.emoji || '🔥'}</span>
								{:else if suggestion.emoji}
									<span class="category-emoji">{suggestion.emoji}</span>
								{:else}
									<Search size={16} />
								{/if}
							</div>
							
							<div class="suggestion-content">
								<span class="suggestion-text">{suggestion.text}</span>
								{#if suggestion.count}
									<span class="suggestion-count">{suggestion.count} items</span>
								{/if}
							</div>

							{#if suggestion.type === 'trending'}
								<div class="trending-indicator">
									<TrendingUp size={12} />
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.search-bar {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 0 auto;
	}

	.search-form {
		width: 100%;
	}

	.search-input-group {
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 2px solid #e2e8f0;
		border-radius: 24px;
		padding: 0 16px;
		transition: all 0.2s ease;
		height: 48px;
		position: relative;
	}

	.search-input-group.focused {
		border-color: #3b82f6;
		background: white;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-icon {
		color: #9ca3af;
		flex-shrink: 0;
		margin-right: 12px;
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		padding: 0;
		font-size: 15px;
		color: #1e293b;
		outline: none;
		min-width: 0;
	}

	.search-input::placeholder {
		color: #94a3b8;
	}

	.clear-button,
	.voice-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s ease;
		flex-shrink: 0;
		margin-left: 4px;
	}

	.clear-button:hover,
	.voice-button:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.voice-button.listening {
		background: #ef4444;
		color: white;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	/* Search Dropdown */
	.search-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		z-index: 130; /* Higher than FilterBar dropdowns */
		max-height: 400px;
		overflow: hidden;
		animation: fadeInScale 0.2s ease-out;
	}

	.dropdown-content {
		padding: 12px 0;
	}

	.dropdown-section {
		padding: 8px 16px 4px;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.clear-recent-btn {
		font-size: 12px;
		color: #ef4444;
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 6px;
		border-radius: 4px;
		transition: background 0.15s ease;
	}

	.clear-recent-btn:hover {
		background: #fef2f2;
	}

	.suggestions-list {
		padding: 4px 0;
	}

	.suggestion-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 16px;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.15s ease;
		text-align: left;
		gap: 12px;
	}

	.suggestion-item:hover {
		background: #f8fafc;
	}

	.suggestion-item.recent:hover {
		background: #f0f9ff;
	}

	.suggestion-item.trending:hover {
		background: #fffbeb;
	}

	.suggestion-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: #9ca3af;
		flex-shrink: 0;
	}

	.trending-emoji,
	.category-emoji {
		font-size: 16px;
		line-height: 1;
	}

	.suggestion-content {
		flex: 1;
		min-width: 0;
	}

	.suggestion-text {
		display: block;
		font-size: 14px;
		font-weight: 500;
		color: #374151;
		line-height: 1.2;
	}

	.suggestion-count {
		display: block;
		font-size: 12px;
		color: #9ca3af;
		margin-top: 2px;
	}

	.trending-indicator {
		color: #f59e0b;
		flex-shrink: 0;
	}

	/* Animation */
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.search-input-group {
			height: 44px;
			padding: 0 12px;
		}

		.search-dropdown {
			border-radius: 12px;
			max-height: 60vh;
		}

		.suggestion-item {
			padding: 12px 16px;
		}

		.suggestion-text {
			font-size: 15px;
		}
	}

	/* Touch device optimizations */
	@media (hover: none) and (pointer: coarse) {
		.suggestion-item {
			min-height: 44px;
			padding: 8px 16px;
		}

		.clear-button,
		.voice-button {
			width: 36px;
			height: 36px;
		}

		.suggestion-item:active {
			background: #e5e7eb;
			transform: scale(0.98);
		}
	}

	/* Focus management */
	.search-input:focus-visible {
		outline: none;
	}

	.suggestion-item:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
		background: #dbeafe;
	}

	/* Dark mode support (optional) */
	@media (prefers-color-scheme: dark) {
		.search-input-group {
			background: #374151;
			border-color: #4b5563;
		}

		.search-input-group.focused {
			background: #1f2937;
			border-color: #3b82f6;
		}

		.search-input {
			color: #f9fafb;
		}

		.search-input::placeholder {
			color: #9ca3af;
		}

		.search-dropdown {
			background: #1f2937;
			border-color: #374151;
		}

		.suggestion-item:hover {
			background: #374151;
		}

		.suggestion-text {
			color: #f9fafb;
		}
	}
</style>