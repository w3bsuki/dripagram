<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext, tick } from 'svelte';
	import type { CommandRootProps, CommandContext, CommandItemData, FilterFunction } from './command/types.js';

	let {
		ref = $bindable(null),
		class: className = '',
		children,
		value = $bindable(''),
		onValueChange,
		filter,
		shouldFilter = true,
		loop = false,
		label = 'Command',
		...props
	}: CommandRootProps = $props();

	// Internal state
	let search = $state('');
	let selected = $state('');
	let filtered = $state(new Map<string, CommandItemData>());
	let groups = $state(new Set<string>());
	let allItems = $state(new Map<string, CommandItemData>());

	// Default filter function - fuzzy search with keyword support
	const defaultFilter: FilterFunction = (value: string, search: string, keywords?: string[]) => {
		if (!search) return 1;
		
		const searchLower = search.toLowerCase();
		const valueLower = value.toLowerCase();
		
		// Exact match gets highest score
		if (valueLower === searchLower) return 1;
		
		// Check if value starts with search
		if (valueLower.startsWith(searchLower)) return 0.9;
		
		// Check if value contains search
		if (valueLower.includes(searchLower)) return 0.8;
		
		// Check keywords if provided
		if (keywords) {
			for (const keyword of keywords) {
				const keywordLower = keyword.toLowerCase();
				if (keywordLower === searchLower) return 0.7;
				if (keywordLower.startsWith(searchLower)) return 0.6;
				if (keywordLower.includes(searchLower)) return 0.5;
			}
		}
		
		// Fuzzy match - check if all characters of search appear in order in value
		let searchIndex = 0;
		for (let i = 0; i < valueLower.length && searchIndex < searchLower.length; i++) {
			if (valueLower[i] === searchLower[searchIndex]) {
				searchIndex++;
			}
		}
		
		return searchIndex === searchLower.length ? 0.3 : 0;
	};

	// Use provided filter or default
	const filterFn = filter || defaultFilter;

	// Update filtered items when search changes
	function updateFiltered() {
		if (!shouldFilter) {
			filtered = new Map(allItems);
			return;
		}

		const newFiltered = new Map<string, CommandItemData>();
		
		for (const [itemValue, itemData] of allItems) {
			if (itemData.disabled) continue;
			
			const score = filterFn(itemValue, search, itemData.keywords);
			if (score > 0) {
				newFiltered.set(itemValue, { ...itemData, score });
			}
		}
		
		filtered = newFiltered;
	}

	// Update selection when filtered items change
	function updateSelection() {
		const filteredValues = Array.from(filtered.keys());
		
		if (filteredValues.length === 0) {
			selected = '';
			return;
		}
		
		// If current selection is not in filtered items, select first
		if (!filteredValues.includes(selected)) {
			selected = filteredValues[0];
		}
	}

	// React to search changes
	$effect(() => {
		updateFiltered();
		updateSelection();
	});

	// Handle value changes
	function handleValueChange(newValue: string) {
		value = newValue;
		onValueChange?.(newValue);
	}

	// Handle item selection
	function handleSelect(itemValue: string) {
		const item = allItems.get(itemValue);
		if (item?.disabled) return;
		
		selected = itemValue;
		handleValueChange(itemValue);
	}

	// Register a command item
	function registerItem(itemValue: string, itemData: CommandItemData) {
		allItems.set(itemValue, itemData);
		updateFiltered();
		
		// Auto-select first item if none selected
		if (!selected && !itemData.disabled) {
			selected = itemValue;
		}
	}

	// Unregister a command item
	function unregisterItem(itemValue: string) {
		allItems.delete(itemValue);
		updateFiltered();
		
		// Update selection if the unregistered item was selected
		if (selected === itemValue) {
			updateSelection();
		}
	}

	// Register a group
	function registerGroup(groupValue: string) {
		groups.add(groupValue);
	}

	// Unregister a group
	function unregisterGroup(groupValue: string) {
		groups.delete(groupValue);
	}

	// Keyboard navigation
	function navigateItems(direction: 'up' | 'down' | 'first' | 'last') {
		const filteredValues = Array.from(filtered.keys());
		if (filteredValues.length === 0) return;

		const currentIndex = filteredValues.indexOf(selected);
		let newIndex: number;

		switch (direction) {
			case 'up':
				newIndex = currentIndex > 0 ? currentIndex - 1 : (loop ? filteredValues.length - 1 : 0);
				break;
			case 'down':
				newIndex = currentIndex < filteredValues.length - 1 ? currentIndex + 1 : (loop ? 0 : filteredValues.length - 1);
				break;
			case 'first':
				newIndex = 0;
				break;
			case 'last':
				newIndex = filteredValues.length - 1;
				break;
		}

		selected = filteredValues[newIndex];
		
		// Scroll the selected item into view
		tick().then(() => {
			const selectedElement = ref?.querySelector(`[data-value="${selected}"]`);
			if (selectedElement) {
				selectedElement.scrollIntoView({ block: 'nearest' });
			}
		});
	}

	// Handle keyboard events
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				navigateItems('down');
				break;
			case 'ArrowUp':
				event.preventDefault();
				navigateItems('up');
				break;
			case 'Home':
				event.preventDefault();
				navigateItems('first');
				break;
			case 'End':
				event.preventDefault();
				navigateItems('last');
				break;
			case 'Enter':
				event.preventDefault();
				if (selected) {
					handleSelect(selected);
				}
				break;
		}
	}

	// Set selected item
	function setSelected(itemValue: string) {
		if (filtered.has(itemValue)) {
			selected = itemValue;
		}
	}

	// Command context for child components
	const commandContext: CommandContext = {
		get value() { return value; },
		get search() { return search; },
		set search(newSearch: string) { search = newSearch; },
		get filtered() { return filtered; },
		get selected() { return selected; },
		get loop() { return loop; },
		onValueChange: handleValueChange,
		onSelect: handleSelect,
		filter: filterFn,
		shouldFilter,
		get groups() { return groups; },
		registerItem,
		unregisterItem,
		registerGroup,
		unregisterGroup,
		navigateItems,
		setSelected
	};

	setContext('command', commandContext);
</script>

<div
	bind:this={ref}
	role="combobox"
	aria-expanded="true"
	aria-haspopup="listbox"
	aria-label={label}
	class={cn(
		'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md',
		className
	)}
	onkeydown={handleKeydown}
	data-slot="command"
	{...props}
>
	{@render children?.()}
</div>