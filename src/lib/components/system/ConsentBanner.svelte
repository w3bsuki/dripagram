<script lang="ts">
	import { browser } from '$app/environment';
	import Button from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '$lib/components/ui/sheet';
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Cookie, Shield, Settings } from '@lucide/svelte';
	import { analytics } from '$lib/services/analytics';
	
	let showBanner = $state(false);
	let showSettings = $state(false);
	
	// Consent preferences
	let consent = $state({
		necessary: true, // Always required
		analytics: false,
		marketing: false,
	});
	
	// Check if consent has been given
	let hasCheckedCookie = $state(false);
	
	$effect(() => {
		if (browser && !hasCheckedCookie) {
			const consentCookie = document.cookie
				.split('; ')
				.find(row => row.startsWith('consent='));
			
			if (!consentCookie) {
				// Show banner after a short delay to not be intrusive
				setTimeout(() => {
					showBanner = true;
				}, 1500);
			} else {
				// Parse existing consent
				try {
					const consentData = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
					consent.analytics = consentData.analytics || false;
					consent.marketing = consentData.marketing || false;
					
					// Set analytics consent - DISABLED: requires proper consent flow
					// analytics.setConsent(consentData.analytics);
				} catch (e) {
					console.error('Failed to parse consent cookie', e);
				}
			}
			
			hasCheckedCookie = true;
		}
	});
	
	async function saveConsent() {
		const consentData = {
			necessary: true,
			analytics: consent.analytics,
			marketing: consent.marketing,
			timestamp: new Date().toISOString(),
		};
		
		// Set cookie for 1 year
		const expires = new Date();
		expires.setFullYear(expires.getFullYear() + 1);
		
		document.cookie = `consent=${encodeURIComponent(JSON.stringify(consentData))}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
		
		// Save to server
		try {
			const response = await fetch('/api/consent', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					consent: consentData,
					userAgent: navigator.userAgent,
					fingerprint: `${navigator.platform}-${navigator.language}-${screen.width}x${screen.height}`
				})
			});
			
			if (response.ok) {
				console.log('✅ Consent saved to server');
			} else {
				console.warn('❌ Failed to save consent to server');
			}
		} catch (error) {
			console.error('❌ Consent save error:', error);
		}
		
		// Set analytics consent
		analytics.setConsent(consent.analytics);
		
		showBanner = false;
		showSettings = false;
	}
	
	async function acceptAll() {
		consent.analytics = true;
		consent.marketing = true;
		await saveConsent();
	}
	
	function rejectAll() {
		consent.analytics = false;
		consent.marketing = false;
		saveConsent();
	}
	
	function openSettings() {
		showSettings = true;
	}
</script>

{#if showBanner && !showSettings}
	<div class="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-slide-up md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border">
		<div class="flex items-start gap-3">
			<div class="p-2 bg-primary/10 rounded-full shrink-0">
				<Cookie class="h-5 w-5 text-primary" />
			</div>
			
			<div class="flex-1 space-y-3">
				<div>
					<h3 class="font-semibold text-foreground">Бисквитки и поверителност</h3>
					<p class="text-sm text-muted-foreground mt-1">
						Използваме бисквитки, за да подобрим вашето изживяване и да анализираме трафика на сайта. 
						Вашата поверителност е важна за нас.
					</p>
				</div>
				
				<div class="flex flex-col sm:flex-row gap-2">
					<Button 
						size="sm" 
						onclick={acceptAll}
						class="w-full sm:w-auto"
					>
						Приемам всички
					</Button>
					<Button 
						size="sm" 
						variant="outline" 
						onclick={rejectAll}
						class="w-full sm:w-auto"
					>
						Отказ
					</Button>
					<Button 
						size="sm" 
						variant="ghost" 
						onclick={openSettings}
						class="w-full sm:w-auto"
					>
						<Settings class="h-4 w-4 mr-2" />
						Настройки
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<Sheet bind:open={showSettings}>
	<SheetContent side="bottom" class="h-auto max-h-[80vh] overflow-y-auto">
		<SheetHeader>
			<SheetTitle class="flex items-center gap-2">
				<Shield class="h-5 w-5" />
				Настройки за поверителност
			</SheetTitle>
			<SheetDescription>
				Управлявайте вашите предпочитания за бисквитки. Можете да промените тези настройки по всяко време.
			</SheetDescription>
		</SheetHeader>
		
		<div class="mt-6 space-y-6">
			<!-- Necessary cookies -->
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<Label class="text-base font-medium">Необходими бисквитки</Label>
					<p class="text-sm text-muted-foreground mt-1">
						Тези бисквитки са необходими за правилното функциониране на сайта и не могат да бъдат изключени.
					</p>
				</div>
				<Switch checked={true} disabled class="mt-1" />
			</div>
			
			<!-- Analytics cookies -->
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<Label htmlFor="analytics" class="text-base font-medium">Аналитични бисквитки</Label>
					<p class="text-sm text-muted-foreground mt-1">
						Помагат ни да разберем как използвате сайта и да подобрим вашето изживяване.
					</p>
				</div>
				<Switch 
					id="analytics" 
					bind:checked={consent.analytics} 
					class="mt-1" 
				/>
			</div>
			
			<!-- Marketing cookies -->
			<div class="flex items-start justify-between gap-4">
				<div class="flex-1">
					<Label htmlFor="marketing" class="text-base font-medium">Маркетингови бисквитки</Label>
					<p class="text-sm text-muted-foreground mt-1">
						Използват се за показване на персонализирани реклами и препоръки.
					</p>
				</div>
				<Switch 
					id="marketing" 
					bind:checked={consent.marketing} 
					class="mt-1" 
				/>
			</div>
		</div>
		
		<div class="mt-6 flex flex-col sm:flex-row gap-2">
			<Button onclick={saveConsent} class="w-full sm:w-auto">
				Запази настройките
			</Button>
			<Button 
				variant="outline" 
				onclick={() => showSettings = false} 
				class="w-full sm:w-auto"
			>
				Отказ
			</Button>
		</div>
	</SheetContent>
</Sheet>

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
</style>