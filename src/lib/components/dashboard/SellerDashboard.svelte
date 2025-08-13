<!-- Seller Dashboard with Phase 4 Monetization Features -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Badge } from '$lib/components/ui/badge';
	import Button from '$lib/components/native/Button.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { 
		TrendingUp, 
		DollarSign, 
		Package, 
		Eye, 
		Heart, 
		Star,
		Crown,
		Shield,
		BarChart3,
		Wallet,
		CreditCard,
		Calendar
	} from '@lucide/svelte';
	import type { User } from '@supabase/supabase-js';
	import { formatCurrency, formatNumber } from '$lib/utils/format';

	// Props
	let { user }: { user: User } = $props();

	// State
	let analytics = $state<any>(null);
	let subscription = $state<any>(null);
	let wallet = $state<any>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Load dashboard data
	onMount(async () => {
		await loadDashboardData();
	});

	async function loadDashboardData() {
		loading = true;
		error = null;

		try {
			// Load analytics data
			const analyticsRes = await fetch('/api/analytics/revenue?period=30d');
			if (analyticsRes.ok) {
				const analyticsData = await analyticsRes.json();
				analytics = analyticsData.data;
			}

			// Load subscription data
			const subscriptionRes = await fetch('/api/subscriptions/current');
			if (subscriptionRes.ok) {
				const subscriptionData = await subscriptionRes.json();
				subscription = subscriptionData.subscription;
			}

			// Load wallet data
			const walletRes = await fetch('/api/wallet');
			if (walletRes.ok) {
				const walletData = await walletRes.json();
				wallet = walletData.wallet;
			}
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
			error = 'Failed to load dashboard data';
		} finally {
			loading = false;
		}
	}

	function getSubscriptionBadgeVariant(status: string) {
		switch (status) {
			case 'active': return 'default';
			case 'trialing': return 'secondary';
			case 'past_due': return 'destructive';
			case 'cancelled': return 'outline';
			default: return 'outline';
		}
	}

	function getSubscriptionIcon(planName: string) {
		switch (planName?.toLowerCase()) {
			case 'premium': return Crown;
			case 'pro': return Star;
			case 'enterprise': return Shield;
			default: return Package;
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
			<p class="text-muted-foreground">
				Manage your listings, track earnings, and grow your business
			</p>
		</div>
		
		{#if subscription}
			{@const IconComponent = getSubscriptionIcon(subscription.plan_name)}
			<div class="flex items-center gap-2">
				<IconComponent class="h-4 w-4" />
				<Badge variant={getSubscriptionBadgeVariant(subscription.status)}>
					{subscription.plan_name} Plan
				</Badge>
			</div>
		{/if}
	</div>

	{#if loading}
		<!-- Loading State -->
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			{#each Array(8) as _}
				<Card>
					<CardHeader class="pb-2">
						<div class="h-4 bg-muted rounded animate-pulse"></div>
					</CardHeader>
					<CardContent>
						<div class="h-8 bg-muted rounded animate-pulse mb-2"></div>
						<div class="h-3 bg-muted rounded animate-pulse w-2/3"></div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if error}
		<!-- Error State -->
		<Card>
			<CardHeader>
				<CardTitle class="text-destructive">Error Loading Dashboard</CardTitle>
				<CardDescription>{error}</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onclick={loadDashboardData}>Retry</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Main Content -->
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
			<!-- Revenue Card -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Total Earnings</CardTitle>
					<DollarSign class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{formatCurrency(analytics?.transactions?.totalEarnings || 0)}
					</div>
					<p class="text-xs text-muted-foreground">
						{analytics?.transactions?.successRate || 0}% success rate
					</p>
				</CardContent>
			</Card>

			<!-- Transactions Card -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Total Sales</CardTitle>
					<Package class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{formatNumber(analytics?.transactions?.completedTransactions || 0)}
					</div>
					<p class="text-xs text-muted-foreground">
						Avg: {formatCurrency(analytics?.transactions?.averageOrderValue || 0)}
					</p>
				</CardContent>
			</Card>

			<!-- Views Card -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Total Views</CardTitle>
					<Eye class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{formatNumber(analytics?.listings?.totalViews || 0)}
					</div>
					<p class="text-xs text-muted-foreground">
						{analytics?.listings?.averageViewsPerListing || 0} per listing
					</p>
				</CardContent>
			</Card>

			<!-- Engagement Card -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium">Engagement</CardTitle>
					<Heart class="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold">
						{formatNumber(analytics?.listings?.totalLikes || 0)}
					</div>
					<p class="text-xs text-muted-foreground">
						{formatNumber(analytics?.listings?.totalShares || 0)} shares
					</p>
				</CardContent>
			</Card>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Wallet Card -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						<Wallet class="h-5 w-5" />
						Wallet Balance
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Available</span>
							<span class="font-semibold">
								{formatCurrency(analytics?.wallet?.available_balance || 0)}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Pending</span>
							<span class="font-semibold">
								{formatCurrency(analytics?.wallet?.pending_balance || 0)}
							</span>
						</div>
						<Separator />
						<div class="flex justify-between">
							<span class="text-sm font-medium">Total Earnings</span>
							<span class="font-bold">
								{formatCurrency(analytics?.wallet?.total_earnings || 0)}
							</span>
						</div>
					</div>
					
					<Button class="w-full" variant="outline">
						<CreditCard class="h-4 w-4 mr-2" />
						Request Payout
					</Button>
				</CardContent>
			</Card>

			<!-- Subscription Card -->
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2">
						{@const IconComponent = getSubscriptionIcon(subscription?.plan_name)}
						<IconComponent class="h-5 w-5" />
						Subscription Plan
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					{#if subscription}
						<div class="space-y-2">
							<div class="flex justify-between items-center">
								<span class="font-medium">{subscription.plan_name}</span>
								<Badge variant={getSubscriptionBadgeVariant(subscription.status)}>
									{subscription.status}
								</Badge>
							</div>
							
							<div class="text-sm text-muted-foreground">
								{formatCurrency(subscription.current_price)} / {subscription.billing_cycle}
							</div>

							{#if subscription.usage}
								<div class="space-y-2">
									<div class="flex justify-between text-sm">
										<span>Listings Used</span>
										<span>{subscription.usage.listings_used} / {subscription.plan.max_listings === -1 ? '∞' : subscription.plan.max_listings}</span>
									</div>
									{#if subscription.plan.max_listings !== -1}
										<Progress value={(subscription.usage.listings_used / subscription.plan.max_listings) * 100} />
									{/if}
								</div>
							{/if}

							<div class="text-xs text-muted-foreground">
								<Calendar class="h-3 w-3 inline mr-1" />
								Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
							</div>
						</div>

						<div class="flex gap-2">
							<Button variant="outline" class="flex-1">
								Manage Plan
							</Button>
							<Button variant="ghost" size="sm">
								Cancel
							</Button>
						</div>
					{:else}
						<div class="text-center py-4">
							<p class="text-sm text-muted-foreground mb-4">
								Upgrade to access premium features
							</p>
							<Button>
								<Crown class="h-4 w-4 mr-2" />
								Upgrade Plan
							</Button>
						</div>
					{/if}
				</CardContent>
			</Card>
		</div>

		<!-- Performance Chart -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<BarChart3 class="h-5 w-5" />
					Performance Overview
				</CardTitle>
				<CardDescription>
					Sales and engagement metrics for the last 30 days
				</CardDescription>
			</CardHeader>
			<CardContent>
				{#if analytics?.timeSeries?.length > 0}
					<!-- Time series chart would go here -->
					<div class="h-[300px] flex items-center justify-center border rounded">
						<p class="text-muted-foreground">Chart visualization would be implemented here</p>
					</div>
				{:else}
					<div class="h-[300px] flex items-center justify-center">
						<p class="text-muted-foreground">No data available for the selected period</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Top Performing Listings -->
		{#if analytics?.summary?.topPerformingListings?.length > 0}
			<Card>
				<CardHeader>
					<CardTitle>Top Performing Listings</CardTitle>
					<CardDescription>
						Your best-performing listings from the last 30 days
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-4">
						{#each analytics.summary.topPerformingListings as listing}
							<div class="flex items-center justify-between p-4 border rounded">
								<div>
									<h4 class="font-medium">{listing.title}</h4>
									<div class="text-sm text-muted-foreground flex gap-4">
										<span class="flex items-center gap-1">
											<Eye class="h-3 w-3" />
											{formatNumber(listing.views)} views
										</span>
										<span class="flex items-center gap-1">
											<Heart class="h-3 w-3" />
											{formatNumber(listing.likes)} likes
										</span>
									</div>
								</div>
								<div class="text-right">
									<div class="font-semibold">{formatCurrency(listing.price)}</div>
									<div class="text-xs text-muted-foreground">
										Sold {new Date(listing.soldAt).toLocaleDateString()}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{/if}
	{/if}
</div>