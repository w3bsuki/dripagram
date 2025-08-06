<script lang="ts">
	import { cn } from '$lib/utils';
	import type { ComponentType } from 'svelte';
	
	// Types
	export interface TabItem {
		id: string;
		icon: ComponentType;
		label: string;
		href?: string;
		badge?: number | string;
		accent?: boolean;
		onClick?: () => void;
	}
	
	interface Props {
		items: TabItem[];
		activeId?: string;
		variant?: 'default' | 'floating' | 'pills';
		size?: 'sm' | 'md' | 'lg';
		showLabels?: boolean;
		class?: string;
		onTabChange?: (id: string) => void;
	}
	
	let {
		items,
		activeId,
		variant = 'default',
		size = 'md',
		showLabels = true,
		class: className,
		onTabChange
	}: Props = $props();
	
	// Size mappings
	const sizeClasses = {
		sm: {
			height: 'h-12',
			icon: 20,
			text: 'text-[10px]',
			badge: 'h-3 w-3 text-[8px]',
			gap: 'gap-0.5'
		},
		md: {
			height: 'h-14',
			icon: 24,
			text: 'text-[11px]',
			badge: 'h-4 w-4 text-[10px]',
			gap: 'gap-0.5'
		},
		lg: {
			height: 'h-16',
			icon: 28,
			text: 'text-xs',
			badge: 'h-5 w-5 text-[11px]',
			gap: 'gap-1'
		}
	};
	
	const currentSize = sizeClasses[size];
	
	// Variant classes
	const variantClasses = {
		default: 'bg-white border-t border-gray-200',
		floating: 'bg-white/95 backdrop-blur-md shadow-lg m-4 rounded-2xl border border-gray-200',
		pills: 'bg-gray-100 p-1 m-4 rounded-2xl'
	};
	
	function handleTabClick(item: TabItem) {
		if (item.onClick) {
			item.onClick();
		}
		if (onTabChange) {
			onTabChange(item.id);
		}
	}
</script>

{#snippet tabIcon(item: TabItem, isActive: boolean)}
	<div class="relative">
		<svelte:component 
			this={item.icon} 
			size={currentSize.icon} 
			strokeWidth={isActive ? 2 : 1.5}
			class={cn(
				"transition-all duration-200",
				isActive && "scale-110"
			)}
		/>
		{#if item.badge}
			<span class={cn(
				"absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold text-white",
				currentSize.badge,
				typeof item.badge === 'string' && item.badge.length > 2 ? 'px-1' : '',
				item.accent ? 'bg-blue-500' : 'bg-red-500'
			)}>
				{item.badge}
			</span>
		{/if}
	</div>
{/snippet}

<nav 
	class={cn(
		"fixed bottom-0 left-0 right-0 z-40",
		"pb-safe-bottom",
		variantClasses[variant],
		className
	)}
	aria-label="Tab navigation"
>
	<div class={cn("flex items-stretch", currentSize.height, variant === 'pills' && 'gap-1')}>
		{#each items as item}
			{@const isActive = activeId === item.id}
			{@const Component = item.href ? 'a' : 'button'}
			
			<svelte:element
				this={Component}
				href={item.href}
				onclick={() => handleTabClick(item)}
				class={cn(
					"relative flex flex-1 flex-col items-center justify-center",
					currentSize.gap,
					"transition-all duration-200",
					"touch-manipulation",
					
					// Default variant
					variant === 'default' && [
						"text-gray-500",
						"active:scale-95 active:bg-gray-50",
						isActive && "text-gray-900",
						item.accent && !isActive && "text-blue-500"
					],
					
					// Floating variant
					variant === 'floating' && [
						"text-gray-500",
						"active:scale-95",
						isActive && "text-gray-900",
						item.accent && !isActive && "text-blue-500"
					],
					
					// Pills variant
					variant === 'pills' && [
						"rounded-xl",
						"text-gray-600",
						"active:scale-95",
						isActive ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-50",
						item.accent && !isActive && "text-blue-500"
					]
				)}
				aria-label={item.label}
				aria-current={isActive ? 'page' : undefined}
			>
				{#if isActive && variant === 'default'}
					<div class="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gray-900" />
				{/if}
				
				{@render tabIcon(item, isActive)}
				
				{#if showLabels}
					<span class={cn(
						currentSize.text,
						"font-medium transition-all duration-200",
						isActive && "font-semibold"
					)}>
						{item.label}
					</span>
				{/if}
			</svelte:element>
		{/each}
	</div>
</nav>