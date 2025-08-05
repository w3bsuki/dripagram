<script lang="ts">
	import { X, Gift, Truck, Shield, Clock, ChevronRight, Sparkles } from '@lucide/svelte';
	
	let bannerDismissed = $state(false);
	let currentSlide = $state(0);
	
	// Promotional banners data
	let banners = [
		{
			id: 'free-shipping',
			type: 'info',
			gradient: 'from-blue-500 to-purple-600',
			icon: Truck,
			title: '🚚 Безплатна доставка',
			description: 'За всички поръчки над 50 лв до края на седмицата!',
			cta: { text: 'Научи повече', href: '/shipping' }
		},
		{
			id: 'new-user',
			type: 'success',
			gradient: 'from-green-500 to-emerald-600',
			icon: Gift,
			title: '🎁 -20% за нови потребители',
			description: 'Използвай код WELCOME20 при първата си покупка',
			cta: { text: 'Регистрирай се', href: '/signup' }
		},
		{
			id: 'flash-sale',
			type: 'urgent',
			gradient: 'from-red-500 to-orange-600',
			icon: Clock,
			title: '⚡ Flash Sale - Само днес!',
			description: 'До 70% намаление на избрани марки',
			cta: { text: 'Виж офертите', href: '/deals' }
		}
	];
	
	// Auto-rotate banners
	$effect(() => {
		if (bannerDismissed) return;
		
		const interval = setInterval(() => {
			currentSlide = (currentSlide + 1) % banners.length;
		}, 5000);
		
		return () => clearInterval(interval);
	});
	
	// Check if banner was previously dismissed
	$effect(() => {
		const dismissed = localStorage.getItem('promoBannerDismissed');
		if (dismissed === 'true') {
			bannerDismissed = true;
		}
	});
	
	function dismissBanner() {
		bannerDismissed = true;
		localStorage.setItem('promoBannerDismissed', 'true');
	}
	
	function nextSlide() {
		currentSlide = (currentSlide + 1) % banners.length;
	}
	
	function prevSlide() {
		currentSlide = currentSlide === 0 ? banners.length - 1 : currentSlide - 1;
	}
</script>

{#if !bannerDismissed}
	<div class="relative bg-gradient-to-r {banners[currentSlide].gradient} text-white overflow-hidden">
		<!-- Animated background pattern -->
		<div class="absolute inset-0 opacity-10">
			<div class="absolute inset-0" style="background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)"></div>
		</div>
		
		<div class="relative max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
			<div class="flex items-center justify-between gap-2 sm:gap-4">
				<!-- Content -->
				<div class="flex-1 flex items-center gap-2 sm:gap-4">
					<!-- Icon -->
					{#if banners[currentSlide]}
						{@const Icon = banners[currentSlide].icon}
						<div class="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 rounded-full flex-shrink-0">
							<Icon size={20} />
						</div>
					{/if}
					
					<!-- Text -->
					<div class="flex-1 min-w-0">
						<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
							<h3 class="font-semibold text-sm sm:text-base leading-tight">
								{banners[currentSlide].title}
							</h3>
							<p class="text-xs sm:text-sm opacity-90 hidden sm:block">
								{banners[currentSlide].description}
							</p>
						</div>
					</div>
					
					<!-- CTA Button -->
					<a 
						href={banners[currentSlide].cta.href}
						class="hidden sm:flex items-center gap-1 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
					>
						{banners[currentSlide].cta.text}
						<ChevronRight size={16} />
					</a>
				</div>
				
				<!-- Controls -->
				<div class="flex items-center gap-2">
					<!-- Banner dots -->
					{#if banners.length > 1}
						<div class="hidden sm:flex items-center gap-1 mr-2">
							{#each banners as _, index}
								<button
									onclick={() => currentSlide = index}
									class="w-1.5 h-1.5 rounded-full transition-all {index === currentSlide ? 'bg-white w-4' : 'bg-white/50'}"
									aria-label="Go to banner {index + 1}"
								/>
							{/each}
						</div>
					{/if}
					
					<!-- Close button -->
					<button
						onclick={dismissBanner}
						class="p-1.5 hover:bg-white/20 rounded-full transition-colors"
						aria-label="Close banner"
					>
						<X size={18} />
					</button>
				</div>
			</div>
			
			<!-- Mobile CTA -->
			<a 
				href={banners[currentSlide].cta.href}
				class="sm:hidden flex items-center justify-center gap-1 mt-2 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
			>
				{banners[currentSlide].cta.text}
				<ChevronRight size={16} />
			</a>
		</div>
		
		<!-- Progress bar -->
		<div class="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
			<div 
				class="h-full bg-white transition-all duration-[5000ms] ease-linear"
				style="width: {((currentSlide + 1) / banners.length) * 100}%"
			/>
		</div>
	</div>
{/if}

<!-- Floating Promo Badge (shows when banner is dismissed) -->
{#if bannerDismissed}
	<div class="fixed bottom-4 right-4 z-40">
		<button
			onclick={() => bannerDismissed = false}
			class="group bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
		>
			<Sparkles size={18} class="group-hover:rotate-12 transition-transform" />
			<span class="text-sm font-medium">Виж оферти</span>
		</button>
	</div>
{/if}