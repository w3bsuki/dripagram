<script lang="ts">
	import Button from '$lib/components/native/Button.svelte';
	import Alert from '$lib/components/native/Alert.svelte';
	import AlertDescription from '$lib/components/native/AlertDescription.svelte';
	import { CheckCircle, AlertCircle, Mail, X } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/stores';

	let { 
		user,
		profile,
		dismissible = true,
		isDismissed = $bindable(false)
	} = $props();

	let locale = $derived($page.params.lang || 'bg');

	function dismiss() {
		isDismissed = true;
	}

	function handleAction(actionType: string) {
		switch(actionType) {
			case 'verify-email':
				// Could trigger resend verification email
				break;
			case 'complete-onboarding':
				window.location.href = `/${locale}/onboarding`;
				break;
			case 'login':
				window.location.href = `/${locale}/auth/login`;
				break;
		}
	}

	// Determine banner type and message
	let bannerData = $derived((() => {
		if (!user) {
			return {
				type: 'info' as const,
				icon: AlertCircle,
				title: 'Guest User',
				message: 'Sign in to access all features like selling and purchasing.',
				actionText: m['auth.sign_in']?.() || 'Sign In',
				actionType: 'login'
			};
		}

		if (user && !user.email_confirmed_at) {
			return {
				type: 'warning' as const,
				icon: Mail,
				title: 'Verify Your Email',
				message: 'Please check your email and click the verification link to activate your account.',
				actionText: 'Resend Email',
				actionType: 'verify-email'
			};
		}

		if (user && user.email_confirmed_at && !profile?.onboarding_completed) {
			return {
				type: 'info' as const,
				icon: AlertCircle,
				title: 'Complete Your Profile',
				message: 'Finish setting up your profile to start selling and purchasing.',
				actionText: 'Complete Setup',
				actionType: 'complete-onboarding'
			};
		}

		// User is fully set up - no banner needed
		return null;
	})());

	// Show banner if there's data and it hasn't been dismissed
	let showBanner = $derived(bannerData && !isDismissed);
</script>

{#if showBanner && bannerData}
	<div class="bg-card border-b border-border">
		<div class="container max-w-6xl mx-auto px-4 py-3">
			<Alert variant={bannerData.type === 'warning' ? 'destructive' : 'default'} class="border-0 bg-transparent p-0">
				<div class="flex items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<svelte:component this={bannerData.icon} class="h-5 w-5 text-{bannerData.type === 'warning' ? 'destructive' : 'primary'}" />
						<div class="flex-1 min-w-0">
							<div class="font-medium text-sm">
								{bannerData.title}
							</div>
							<AlertDescription class="text-sm text-muted-foreground mt-1">
								{bannerData.message}
							</AlertDescription>
						</div>
					</div>
					
					<div class="flex items-center gap-2">
						<Button 
							size="sm" 
							variant={bannerData.type === 'warning' ? 'destructive' : 'default'}
							onclick={() => handleAction(bannerData.actionType)}
						>
							{bannerData.actionText}
						</Button>
						
						{#if dismissible}
							<Button 
								size="sm" 
								variant="ghost"
								onclick={dismiss}
								aria-label="Dismiss"
							>
								<X class="h-4 w-4" />
							</Button>
						{/if}
					</div>
				</div>
			</Alert>
		</div>
	</div>
{/if}