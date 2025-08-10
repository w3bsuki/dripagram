<script lang="ts">
	import Star from '@lucide/svelte/icons/star';
	import Trophy from '@lucide/svelte/icons/trophy';
	import Award from '@lucide/svelte/icons/award';
	import Crown from '@lucide/svelte/icons/crown';
	import Zap from '@lucide/svelte/icons/zap';

	let { 
		level = 'new',
		totalSales = 0,
		rating = 0,
		size = 'small',
		class: className = ''
	}: {
		level?: 'new' | 'rising' | 'trusted' | 'pro' | 'elite';
		totalSales?: number;
		rating?: number;
		size?: 'small' | 'medium' | 'large';
		class?: string;
	} = $props();

	// Calculate level based on sales if not provided
	const calculatedLevel = $derived(() => {
		if (totalSales >= 500) return 'elite';
		if (totalSales >= 200) return 'pro';
		if (totalSales >= 50) return 'trusted';
		if (totalSales >= 10) return 'rising';
		return 'new';
	});

	const badgeLevel = $derived(level || calculatedLevel());

	const badgeConfig = $derived(() => {
		switch (badgeLevel) {
			case 'elite':
				return {
					icon: Crown,
					label: 'Elite Seller',
					color: 'bg-gradient-to-r from-purple-500 to-pink-500',
					textColor: 'text-white',
					borderColor: 'border-purple-500'
				};
			case 'pro':
				return {
					icon: Trophy,
					label: 'Pro Seller',
					color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
					textColor: 'text-white',
					borderColor: 'border-yellow-500'
				};
			case 'trusted':
				return {
					icon: Award,
					label: 'Trusted',
					color: 'bg-blue-500',
					textColor: 'text-white',
					borderColor: 'border-blue-500'
				};
			case 'rising':
				return {
					icon: Zap,
					label: 'Rising Star',
					color: 'bg-green-500',
					textColor: 'text-white',
					borderColor: 'border-green-500'
				};
			default:
				return {
					icon: Star,
					label: 'New Seller',
					color: 'bg-gray-400',
					textColor: 'text-white',
					borderColor: 'border-gray-400'
				};
		}
	});

	const sizeClasses = $derived(() => {
		switch (size) {
			case 'large':
				return 'px-3 py-1.5 text-sm gap-1.5';
			case 'medium':
				return 'px-2 py-1 text-xs gap-1';
			default:
				return 'px-1.5 py-0.5 text-xs gap-0.5';
		}
	});

	const iconSize = $derived(() => {
		switch (size) {
			case 'large': return 16;
			case 'medium': return 14;
			default: return 12;
		}
	});
</script>

<div class="seller-badge {badgeConfig().color} {badgeConfig().textColor} {sizeClasses()} {className}">
	<svelte:component this={badgeConfig().icon} size={iconSize()} />
	<span class="font-medium">{badgeConfig().label}</span>
	{#if totalSales > 0 && size !== 'small'}
		<span class="opacity-90">({totalSales}+ sales)</span>
	{/if}
</div>

<style>
	.seller-badge {
		display: inline-flex;
		align-items: center;
		border-radius: 9999px;
		font-weight: 500;
		white-space: nowrap;
	}
</style>