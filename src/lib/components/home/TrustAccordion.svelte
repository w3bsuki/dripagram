<script lang="ts">
	import {
		Shield,
		Users,
		Heart,
		Zap,
		CheckCircle,
		Star,
		Clock,
		MessageCircle,
	} from '@lucide/svelte';
	import * as Accordion from '$lib/components/ui/accordion';

	// Trust indicators data
	let trustFeatures = [
		{
			icon: Shield,
			title: 'Сигурност и защита',
			value: 'how-secure',
			description: 'Как защитаваме твоите данни и транзакции',
			content: `
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<CheckCircle size={14} />
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-1">SSL шифроване</h4>
							<p class="text-sm text-gray-600">Всички данни се пренасят със 256-bit SSL криптиране</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<CheckCircle size={14} />
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-1">Верификация на потребители</h4>
							<p class="text-sm text-gray-600">Задължителна верификация на телефон и email адрес</p>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<CheckCircle size={14} />
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-1">Модерация на съдържание</h4>
							<p class="text-sm text-gray-600">24/7 наблюдение и бърза реакция при нарушения</p>
						</div>
					</div>
				</div>
			`,
		},
		{
			icon: Users,
			title: 'Как работи платформата',
			value: 'how-it-works',
			description: 'Лесни стъпки за купуване и продаване',
			content: `
				<div class="space-y-6">
					<div class="grid md:grid-cols-2 gap-6">
						<div>
							<h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
								За продавачи
							</h4>
							<ul class="space-y-2 text-sm text-gray-600">
								<li>• Снимай продукта с телефона си</li>
								<li>• Добави описание и цена</li>
								<li>• Обяви се публикува веднага</li>
								<li>• Получаваш съобщения от купувачи</li>
								<li>• Уговаряте среща и завършвате сделката</li>
							</ul>
						</div>
						<div>
							<h4 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<span class="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
								За купувачи
							</h4>
							<ul class="space-y-2 text-sm text-gray-600">
								<li>• Търси или разглеждай категории</li>
								<li>• Филтрирай по цена, състояние, локация</li>
								<li>• Свържи се директно с продавача</li>
								<li>• Договори цена и място за срещане</li>
								<li>• Остави отзив след покупката</li>
							</ul>
						</div>
					</div>
				</div>
			`,
		},
		{
			icon: Heart,
			title: 'Защо потребителите ни избират',
			value: 'why-choose-us',
			description: 'Над 50,000 доволни потребители споделят защо',
			content: `
				<div class="space-y-4">
					<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div class="flex items-center gap-3 mb-2">
							<Star class="text-yellow-500 fill-yellow-500" size={16} />
							<span class="font-semibold text-gray-900">4.9/5 средна оценка</span>
						</div>
						<p class="text-sm text-gray-600">"Най-бързата и сигурна платформа в България. Продадох си лаптопа за 2 дни!"</p>
						<p class="text-xs text-gray-500 mt-2">- Мария, София</p>
					</div>
					<div class="bg-green-50 border border-green-200 rounded-lg p-4">
						<div class="flex items-center gap-3 mb-2">
							<Clock class="text-green-600" size={16} />
							<span class="font-semibold text-gray-900">Средно време за продажба: 3 дни</span>
						</div>
						<p class="text-sm text-gray-600">"Невероятно бързо! Качих обявата в неделя, в сряда вече имах купувач."</p>
						<p class="text-xs text-gray-500 mt-2">- Георги, Пловдив</p>
					</div>
					<div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
						<div class="flex items-center gap-3 mb-2">
							<MessageCircle class="text-purple-600" size={16} />
							<span class="font-semibold text-gray-900">98% отговори в рамките на 1 час</span>
						</div>
						<p class="text-sm text-gray-600">"Винаги получавам бърз отговор. Потребителите тук са много активни."</p>
						<p class="text-xs text-gray-500 mt-2">- Анна, Варна</p>
					</div>
				</div>
			`,
		},
		{
			icon: Zap,
			title: 'Често задавани въпроси',
			value: 'faq',
			description: 'Отговори на най-често задаваните въпроси',
			content: `
				<div class="space-y-4">
					<div>
						<h5 class="font-semibold text-gray-900 mb-2">Колко струва да публикувам обява?</h5>
						<p class="text-sm text-gray-600">Публикуването на обяви е напълно безплатно. Таксуваме само допълнителни услуги като промотиране или топ позициониране.</p>
					</div>
					<div>
						<h5 class="font-semibold text-gray-900 mb-2">Как мога да се срещна безопасно с купувача?</h5>
						<p class="text-sm text-gray-600">Препоръчваме срещи на обществени места като мол, кафе или паркинг. Никога не канете непознати у дома си.</p>
					</div>
					<div>
						<h5 class="font-semibold text-gray-900 mb-2">Мога ли да върна продукт?</h5>
						<p class="text-sm text-gray-600">Driplo.bg е платформа за свързване. Условията за връщане се договарят директно между купувач и продавач.</p>
					</div>
					<div>
						<h5 class="font-semibold text-gray-900 mb-2">Как да разпозная фалшива обява?</h5>
						<p class="text-sm text-gray-600">Внимавайте за подозрително ниски цени, искания за предплащане или липса на реални снимки. Винаги се срещайте лично.</p>
					</div>
					<div>
						<h5 class="font-semibold text-gray-900 mb-2">Мога ли да пратя пари предварително?</h5>
						<p class="text-sm text-gray-600">Не препоръчваме предплащания. Винаги плащайте след като видите и прегледате продукта лично.</p>
					</div>
				</div>
			`,
		},
	];

	let openValues = $state(['how-it-works']); // Default open
</script>

<section class="bg-gray-50 py-12 md:py-16">
	<div class="mx-auto max-w-4xl px-4">
		<!-- Section Header -->
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
				Защо да се доверяваш на Driplo.bg?
			</h2>
			<p class="text-lg text-gray-600">
				Сигурна, бърза и надеждна платформа за втора употреба стоки в България
			</p>
		</div>

		<!-- Trust Stats -->
		<div class="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
			<div class="text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
				>
					<Users size={24} />
				</div>
				<div class="text-2xl font-bold text-gray-900">50k+</div>
				<div class="text-sm text-gray-600">Активни потребители</div>
			</div>
			<div class="text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600"
				>
					<CheckCircle size={24} />
				</div>
				<div class="text-2xl font-bold text-gray-900">200k+</div>
				<div class="text-sm text-gray-600">Успешни сделки</div>
			</div>
			<div class="text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600"
				>
					<Star size={24} />
				</div>
				<div class="text-2xl font-bold text-gray-900">4.9</div>
				<div class="text-sm text-gray-600">Средна оценка</div>
			</div>
			<div class="text-center">
				<div
					class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600"
				>
					<Shield size={24} />
				</div>
				<div class="text-2xl font-bold text-gray-900">100%</div>
				<div class="text-sm text-gray-600">Сигурност</div>
			</div>
		</div>

		<!-- Accordion -->
		<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
			<Accordion.Root type="multiple" bind:value={openValues} class="w-full">
				{#each trustFeatures as feature, index}
					{@const IconComponent = feature.icon}
					<Accordion.Item value={feature.value}>
						<Accordion.Trigger
							class="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-gray-50"
						>
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100"
							>
								<IconComponent size={20} class="text-gray-600" />
							</div>
							<div class="flex-1">
								<h3 class="mb-1 font-semibold text-gray-900">{feature.title}</h3>
								<p class="text-sm text-gray-600">{feature.description}</p>
							</div>
							<div class="accordion-chevron transition-transform duration-200">
								<svg
									width="15"
									height="15"
									viewBox="0 0 15 15"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="m4.93179 5.43179c.20811-.20811.54565-.20811.75376 0l2.06066 2.06066c.4929.4929 1.2936.4929 1.7865 0l2.0607-2.06066c.2081-.20811.5456-.20811.7537 0 .2081.20811.2081.54565 0 .75376l-2.7829 2.78289c-.6834.6834-1.7929.6834-2.4763 0l-2.78289-2.78289c-.20811-.20811-.20811-.54565 0-.75376z"
										fill="currentColor"
									/>
								</svg>
							</div>
						</Accordion.Trigger>
						<Accordion.Content class="px-6 pb-6">
							<div class="prose prose-sm max-w-none">
								{@html feature.content}
							</div>
						</Accordion.Content>
					</Accordion.Item>
					{#if index < trustFeatures.length - 1}
						<div class="border-t border-gray-100"></div>
					{/if}
				{/each}
			</Accordion.Root>
		</div>

		<!-- Call to Action -->
		<div class="mt-12 text-center">
			<div class="from-primary rounded-2xl bg-gradient-to-r to-blue-600 p-8 text-white">
				<h3 class="mb-2 text-xl font-bold">Готов да започнеш?</h3>
				<p class="mb-6 opacity-90">
					Създай своята първа обява за минути и стани част от нашата общност
				</p>
				<div class="flex flex-col justify-center gap-4 sm:flex-row">
					<a
						href="/sell"
						class="text-primary rounded-xl bg-white px-6 py-3 font-medium transition-colors hover:bg-gray-100"
					>
						Продай сега
					</a>
					<a
						href="/products"
						class="rounded-xl border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
					>
						Разгледай продукти
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* Accordion chevron rotation */
	:global([data-state='open']) .accordion-chevron {
		transform: rotate(180deg);
	}

	/* Prose styles for accordion content */
	.prose h4 {
		margin-top: 0;
		margin-bottom: 0.25rem;
	}

	.prose p {
		margin-top: 0;
		margin-bottom: 0;
	}

	.prose ul {
		margin-top: 0;
		margin-bottom: 0;
		padding-left: 1rem;
	}

	.prose li {
		margin-top: 0;
		margin-bottom: 0.25rem;
	}
</style>
