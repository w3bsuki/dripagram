<script lang="ts">
	import { Home, Search, PlusCircle, MessageCircle, User, Heart, Camera, Settings } from '@lucide/svelte';
	import TabBar from '$lib/components/navigation/TabBar.svelte';
	import BottomNav from '$lib/components/navigation/BottomNav.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	
	let activeTab = $state('home');
	let variant = $state<'default' | 'floating' | 'pills'>('default');
	let size = $state<'sm' | 'md' | 'lg'>('md');
	let showLabels = $state(true);
	
	const mainTabs = [
		{ id: 'home', icon: Home, label: 'Home' },
		{ id: 'search', icon: Search, label: 'Search' },
		{ id: 'add', icon: PlusCircle, label: 'Add', accent: true },
		{ id: 'messages', icon: MessageCircle, label: 'Messages' },
		{ id: 'profile', icon: User, label: 'Profile' }
	];
	
	const socialTabs = [
		{ id: 'feed', icon: Home, label: 'Feed' },
		{ id: 'explore', icon: Search, label: 'Explore' },
		{ id: 'camera', icon: Camera, label: 'Create', accent: true },
		{ id: 'likes', icon: Heart, label: 'Activity', badge: '9+' },
		{ id: 'settings', icon: Settings, label: 'Settings' }
	];
</script>

<div class="min-h-screen bg-gray-50 pb-32">
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-8 text-3xl font-bold text-gray-900">Navigation Components</h1>
		
		<!-- Controls -->
		<div class="mb-8 space-y-4 rounded-xl bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-lg font-semibold">TabBar Controls</h2>
			
			<div class="flex flex-wrap gap-2">
				<Button 
					variant={variant === 'default' ? 'default' : 'outline'}
					size="sm"
					onclick={() => variant = 'default'}
				>
					Default
				</Button>
				<Button 
					variant={variant === 'floating' ? 'default' : 'outline'}
					size="sm"
					onclick={() => variant = 'floating'}
				>
					Floating
				</Button>
				<Button 
					variant={variant === 'pills' ? 'default' : 'outline'}
					size="sm"
					onclick={() => variant = 'pills'}
				>
					Pills
				</Button>
			</div>
			
			<div class="flex flex-wrap gap-2">
				<Button 
					variant={size === 'sm' ? 'default' : 'outline'}
					size="sm"
					onclick={() => size = 'sm'}
				>
					Small
				</Button>
				<Button 
					variant={size === 'md' ? 'default' : 'outline'}
					size="sm"
					onclick={() => size = 'md'}
				>
					Medium
				</Button>
				<Button 
					variant={size === 'lg' ? 'default' : 'outline'}
					size="sm"
					onclick={() => size = 'lg'}
				>
					Large
				</Button>
			</div>
			
			<div>
				<Button 
					variant={showLabels ? 'default' : 'outline'}
					size="sm"
					onclick={() => showLabels = !showLabels}
				>
					{showLabels ? 'Hide' : 'Show'} Labels
				</Button>
			</div>
			
			<div class="mt-4 rounded-lg bg-gray-50 p-3">
				<p class="text-sm text-gray-600">Active Tab: <span class="font-semibold">{activeTab}</span></p>
			</div>
		</div>
		
		<!-- Demo Content -->
		<div class="space-y-4">
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h3 class="mb-2 text-lg font-semibold">E-commerce Navigation</h3>
				<p class="text-sm text-gray-600">Standard bottom navigation for marketplace</p>
			</div>
			
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h3 class="mb-2 text-lg font-semibold">Social Media Style</h3>
				<p class="text-sm text-gray-600">Instagram-like navigation with activity badges</p>
			</div>
			
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<h3 class="mb-2 text-lg font-semibold">Features</h3>
				<ul class="space-y-2 text-sm text-gray-600">
					<li>✅ Fully responsive with Tailwind CSS v4</li>
					<li>✅ Svelte 5 with runes ($state, $props, $derived)</li>
					<li>✅ Modular and reusable components</li>
					<li>✅ TypeScript support</li>
					<li>✅ Accessible (ARIA labels, keyboard navigation)</li>
					<li>✅ Safe area padding for mobile devices</li>
					<li>✅ Multiple variants and sizes</li>
					<li>✅ Badge support for notifications</li>
					<li>✅ Accent colors for primary actions</li>
					<li>✅ Smooth animations and transitions</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<!-- Demo TabBar -->
<TabBar 
	items={activeTab === 'settings' ? socialTabs : mainTabs}
	activeId={activeTab}
	{variant}
	{size}
	{showLabels}
	onTabChange={(id) => activeTab = id}
/>

<style>
	:global(.pb-safe-bottom) {
		padding-bottom: env(safe-area-inset-bottom, 0);
	}
</style>