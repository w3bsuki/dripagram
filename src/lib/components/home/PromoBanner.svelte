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
			cta: { text: 'Научи повече', href: '/shipping' },
		},
		{
			id: 'new-user',
			type: 'success',
			gradient: 'from-green-500 to-emerald-600',
			icon: Gift,
			title: '🎁 -20% за нови потребители',
			description: 'Използвай код WELCOME20 при първата си покупка',
			cta: { text: 'Регистрирай се', href: '/signup' },
		},
		{
			id: 'flash-sale',
			type: 'urgent',
			gradient: 'from-red-500 to-orange-600',
			icon: Clock,
			title: '⚡ Flash Sale - Само днес!',
			description: 'До 70% намаление на избрани марки',
			cta: { text: 'Виж офертите', href: '/deals' },
		},
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
	<div
		class="relative bg-gradient-to-r {banners[currentSlide].gradient} overflow-hidden text-white"
	>
		<!-- Animated background pattern -->
		<div class="absolute inset-0 opacity-10">
			<div
				class="absolute inset-0"
				style="background-image: repeating-linear-gradient(45deg, transparent, transparent var(--space-2-5), hsl(var(--background) / 0.1) var(--space-2-5), hsl(var(--background) / 0.1) var(--space-5))"
			></div>
		</div>

		<div class="relative mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-3">
			<div class="flex items-center justify-between gap-2 sm:gap-4">
				<!-- Content -->
				<div class="flex flex-1 items-center gap-2 sm:gap-4">
					<!-- Icon -->
					{#if banners[currentSlide]}
						{@const Icon = banners[currentSlide].icon}
						<div
							class="hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 sm:flex"
						>
							<Icon size={20} />
						</div>
					{/if}

					<!-- Text -->
					<div class="min-w-0 flex-1">
						<div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
							<h3 class="text-sm leading-tight font-semibold sm:text-base">
								{banners[currentSlide].title}
							</h3>
							<p class="hidden text-xs opacity-90 sm:block sm:text-sm">
								{banners[currentSlide].description}
							</p>
						</div>
					</div>

					<!-- CTA Button -->
					<a
						href={banners[currentSlide].cta.href}
						class="hidden items-center gap-1 rounded-full bg-white/20 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/30 sm:flex"
					>
						{banners[currentSlide].cta.text}
						<ChevronRight size={16} />
					</a>
				</div>

				<!-- Controls -->
				<div class="flex items-center gap-2">
					<!-- Banner dots -->
					{#if banners.length > 1}
						<div class="mr-2 hidden items-center gap-1 sm:flex">
							{#each banners as _, index}
								<button
									onclick={() => (currentSlide = index)}
									class="h-1.5 w-1.5 rounded-full transition-all {index === currentSlide
										? 'w-4 bg-white'
										: 'bg-white/50'}"
									aria-label="Go to banner {index + 1}"
								></button>
							{/each}
						</div>
					{/if}

					<!-- Close button -->
					<button
						onclick={dismissBanner}
						class="rounded-full p-1.5 transition-colors hover:bg-white/20"
						aria-label="Close banner"
					>
						<X size={18} />
					</button>
				</div>
			</div>

			<!-- Mobile CTA -->
			<a
				href={banners[currentSlide].cta.href}
				class="mt-2 flex items-center justify-center gap-1 rounded-full bg-white/20 py-1.5 text-sm font-medium transition-colors hover:bg-white/30 sm:hidden"
			>
				{banners[currentSlide].cta.text}
				<ChevronRight size={16} />
			</a>
		</div>

		<!-- Progress bar -->
		<div class="absolute right-0 bottom-0 left-0 h-0.5 bg-white/20">
			<div
				class="h-full bg-white transition-all duration-[5000ms] ease-linear"
				style="width: {((currentSlide + 1) / banners.length) * 100}%"
			></div>
		</div>
	</div>
{/if}

<!-- Floating Promo Badge (shows when banner is dismissed) -->
{#if bannerDismissed}
	<div class="fixed right-4 bottom-4 z-40">
		<button
			onclick={() => (bannerDismissed = false)}
			class="group from-primary flex items-center gap-2 rounded-full bg-gradient-to-r to-blue-600 px-4 py-3 text-white shadow-lg transition-all hover:shadow-xl"
		>
			<Sparkles size={18} class="transition-transform group-hover:rotate-12" />
			<span class="text-sm font-medium">Виж оферти</span>
		</button>
	</div>
{/if}
