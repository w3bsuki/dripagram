<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle, LogIn, UserPlus } from '@lucide/svelte';
	import * as m from '$lib/paraglide/messages';
	import { page } from '$app/stores';

	let { 
		isOpen = $bindable(false), 
		message = "You need to be logged in to perform this action.",
		actionType = "general" as "purchase" | "sell" | "favorite" | "general"
	} = $props();

	let locale = $derived($page.params.lang || 'bg');

	function closeModal() {
		isOpen = false;
	}

	function handleLogin() {
		const currentPath = $page.url.pathname;
		window.location.href = `/${locale}/auth/login?redirectTo=${encodeURIComponent(currentPath)}`;
	}

	function handleSignup() {
		const currentPath = $page.url.pathname;
		window.location.href = `/${locale}/auth/signup?redirectTo=${encodeURIComponent(currentPath)}`;
	}

	// Get action-specific message
	let actionMessage = $derived((() => {
		switch(actionType) {
			case 'purchase':
				return "Please log in to make purchases.";
			case 'sell':
				return "Please log in to start selling.";
			case 'favorite':
				return "Please log in to save favorites.";
			default:
				return message;
		}
	})());
</script>

{#if isOpen}
	<!-- Modal Overlay -->
	<div 
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeModal}
		role="button"
		tabindex="0"
	>
		<!-- Modal Content -->
		<div 
			class="bg-card rounded-lg border border-border shadow-lg max-w-md w-full p-6"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-labelledby="modal-title"
		>
			<!-- Header -->
			<div class="flex items-center gap-3 mb-4">
				<div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
					<AlertCircle class="w-5 h-5 text-primary" />
				</div>
				<div>
					<h2 id="modal-title" class="text-lg font-semibold text-foreground">
						Login Required
					</h2>
				</div>
			</div>

			<!-- Message -->
			<Alert class="mb-6">
				<AlertCircle class="h-4 w-4" />
				<AlertDescription>
					{actionMessage}
				</AlertDescription>
			</Alert>

			<!-- Actions -->
			<div class="flex flex-col gap-3">
				<Button onclick={handleLogin} class="w-full">
					<LogIn class="w-4 h-4 mr-2" />
					{m['auth.sign_in']?.() || 'Sign In'}
				</Button>
				
				<Button variant="outline" onclick={handleSignup} class="w-full">
					<UserPlus class="w-4 h-4 mr-2" />
					{m['auth.signup']?.() || 'Create Account'}
				</Button>

				<Button variant="ghost" onclick={closeModal} class="w-full">
					{m['common.cancel']?.() || 'Cancel'}
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Prevent body scroll when modal is open */
	:global(body:has(.fixed.inset-0.bg-black\/50)) {
		overflow: hidden;
	}
</style>