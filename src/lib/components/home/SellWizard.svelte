<script lang="ts">
	import {
		Camera,
		Upload,
		DollarSign,
		Tag,
		MapPin,
		CheckCircle,
		ArrowRight,
		ArrowLeft,
		Plus,
	} from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Sheet from '$lib/components/ui/sheet';
	import { onMount } from 'svelte';

	// Props
	let { trigger = 'Продай бързо' } = $props();

	// State
	let isOpen = $state(false);
	let isMobile = $state(false);
	let currentStep = $state(1);
	let formData = $state({
		title: '',
		category: '',
		condition: '',
		price: '',
		description: '',
		location: 'София',
		images: [] as string[],
	});

	// Categories
	let categories = [
		{ id: 'women', label: 'Дамски', emoji: '👗' },
		{ id: 'men', label: 'Мъжки', emoji: '👔' },
		{ id: 'kids', label: 'Детски', emoji: '🧸' },
		{ id: 'electronics', label: 'Електроника', emoji: '📱' },
		{ id: 'home', label: 'Дом', emoji: '🏠' },
		{ id: 'sports', label: 'Спорт', emoji: '⚽' },
	];

	// Conditions
	let conditions = [
		{ id: 'new', label: 'Ново', description: 'Неизползвано, с етикети' },
		{ id: 'excellent', label: 'Отлично', description: 'Като ново, без дефекти' },
		{ id: 'very-good', label: 'Много добро', description: 'Леки следи от употреба' },
		{ id: 'good', label: 'Добро', description: 'Видими следи, но функционално' },
		{ id: 'fair', label: 'Задоволително', description: 'Значителни следи от износване' },
	];

	// Locations
	let locations = ['София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора'];

	// Steps configuration
	let steps = [
		{ id: 1, title: 'Категория', icon: Tag },
		{ id: 2, title: 'Снимки', icon: Camera },
		{ id: 3, title: 'Детайли', icon: DollarSign },
		{ id: 4, title: 'Готово', icon: CheckCircle },
	];

	// Check if mobile
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	});

	function nextStep() {
		if (currentStep < 4) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function canProceed(): boolean {
		switch (currentStep) {
			case 1:
				return formData.category !== '';
			case 2:
				return formData.images.length > 0;
			case 3:
				return formData.title !== '' && formData.price !== '' && formData.condition !== '';
			default:
				return true;
		}
	}

	function handleImageUpload() {
		// Mock image upload
		formData.images = [...formData.images, `https://picsum.photos/200/200?random=${Date.now()}`];
	}

	function removeImage(index: number) {
		formData.images = formData.images.filter((_, i) => i !== index);
	}

	function handleSubmit() {
		// TODO: Implement actual form submission
		isOpen = false;
		currentStep = 1;
		// Reset form
		formData = {
			title: '',
			category: '',
			condition: '',
			price: '',
			description: '',
			location: 'София',
			images: [],
		};
	}

	// Render step content
	function renderStepContent() {
		switch (currentStep) {
			case 1:
				return `
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Избери категория</h3>
						<div class="grid grid-cols-2 gap-3">
							${categories
								.map(
									(category) => `
								<button 
									onclick="formData.category = '${category.id}'"
									class="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all ${formData.category === category.id ? 'border-primary bg-primary/10' : ''}"
								>
									<div class="text-2xl mb-2">${category.emoji}</div>
									<div class="font-medium text-gray-900">${category.label}</div>
								</button>
							`
								)
								.join('')}
						</div>
					</div>
				`;
			case 2:
				return `
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Добави снимки (${formData.images.length}/10)</h3>
						<div class="grid grid-cols-3 gap-3">
							${formData.images
								.map(
									(img, index) => `
								<div class="relative aspect-square">
									<img src="${img}" alt="Product ${index + 1}" class="w-full h-full object-cover rounded-lg" />
									<button 
										onclick="removeImage(${index})"
										class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
									>×</button>
								</div>
							`
								)
								.join('')}
							${
								formData.images.length < 10
									? `
								<button 
									onclick="handleImageUpload()"
									class="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
								>
									<Plus size={24} class="text-gray-400 mb-2" />
									<span class="text-sm text-gray-600">Добави</span>
								</button>
							`
									: ''
							}
						</div>
						<p class="text-sm text-gray-600">Първата снимка ще бъде основна. Добави поне 3 снимки за по-добри резултати.</p>
					</div>
				`;
			case 3:
				return `
					<div class="space-y-4">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Детайли за продукта</h3>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Заглавие</label>
							<input 
								bind:value={formData.title}
								type="text" 
								placeholder="Например: iPhone 13 Pro 128GB"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Цена (лв)</label>
							<input 
								bind:value={formData.price}
								type="number" 
								placeholder="0"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Състояние</label>
							<div class="space-y-2">
								${conditions
									.map(
										(condition) => `
									<button 
										onclick="formData.condition = '${condition.id}'"
										class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all ${formData.condition === condition.id ? 'border-primary bg-primary/10' : ''}"
									>
										<div class="font-medium text-gray-900">${condition.label}</div>
										<div class="text-sm text-gray-600">${condition.description}</div>
									</button>
								`
									)
									.join('')}
							</div>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-1">Описание (опционално)</label>
							<textarea 
								bind:value={formData.description}
								rows="3"
								placeholder="Добави повече детайли за продукта..."
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
							></textarea>
						</div>
					</div>
				`;
			case 4:
				return `
					<div class="text-center space-y-4">
						<div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
							<CheckCircle size={32} />
						</div>
						<h3 class="text-lg font-semibold text-gray-900">Готово за публикуване!</h3>
						<p class="text-gray-600">Прегледай обявата си преди да я публикуваш</p>
						<div class="bg-gray-50 rounded-lg p-4 text-left">
							<div class="flex gap-3">
								${formData.images.length > 0 ? `<img src="${formData.images[0]}" alt="Product" class="w-16 h-16 object-cover rounded-lg" />` : ''}
								<div class="flex-1">
									<h4 class="font-semibold text-gray-900">${formData.title}</h4>
									<p class="text-lg font-bold text-primary">${formData.price} лв</p>
									<p class="text-sm text-gray-600">${formData.condition} • ${formData.location}</p>
								</div>
							</div>
						</div>
					</div>
				`;
			default:
				return '';
		}
	}
</script>

<!-- Desktop Dialog -->
{#if !isMobile}
	<Dialog.Root bind:open={isOpen}>
		<Dialog.Trigger>
			<button
				class="bg-primary hover:bg-primary/90 rounded-xl px-6 py-3 font-medium text-white transition-colors"
			>
				{trigger}
			</button>
		</Dialog.Trigger>
		<Dialog.Content class="max-h-[90vh] max-w-2xl overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Създай обява за 3 минути</Dialog.Title>
			</Dialog.Header>

			<!-- Progress Steps -->
			<div class="mb-6 flex items-center justify-between">
				{#each steps as step}
					<div class="flex items-center">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full {currentStep >= step.id
								? 'bg-primary text-white'
								: 'bg-gray-200 text-gray-600'}"
						>
							{#if currentStep > step.id}
								<CheckCircle size={16} />
							{:else}
								{@const IconComponent = step.icon}
								<IconComponent size={16} />
							{/if}
						</div>
						<span
							class="ml-2 text-sm font-medium {currentStep >= step.id
								? 'text-primary'
								: 'text-gray-500'}">{step.title}</span
						>
						{#if step.id < steps.length}
							<div
								class="mx-4 h-0.5 w-8 {currentStep > step.id ? 'bg-primary' : 'bg-gray-200'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Step Content -->
			<div class="mb-6">
				{@html renderStepContent()}
			</div>

			<!-- Navigation -->
			<div class="flex justify-between">
				<button
					onclick={prevStep}
					disabled={currentStep === 1}
					class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<ArrowLeft size={16} />
					Назад
				</button>

				{#if currentStep < 4}
					<button
						onclick={nextStep}
						disabled={!canProceed()}
						class="bg-primary hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						Напред
						<ArrowRight size={16} />
					</button>
				{:else}
					<button
						onclick={handleSubmit}
						class="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
					>
						Публикувай обявата
					</button>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Mobile Sheet -->
{:else}
	<Sheet.Root bind:open={isOpen}>
		<Sheet.Trigger>
			<button
				class="bg-primary hover:bg-primary/90 rounded-xl px-6 py-3 font-medium text-white transition-colors"
			>
				{trigger}
			</button>
		</Sheet.Trigger>
		<Sheet.Content side="bottom" class="h-[90vh]">
			<Sheet.Header>
				<Sheet.Title>Създай обява</Sheet.Title>
			</Sheet.Header>

			<!-- Mobile Progress -->
			<div class="mb-6 flex justify-center">
				<div class="flex items-center gap-2">
					{#each steps as step}
						<div
							class="h-2 w-2 rounded-full {currentStep >= step.id ? 'bg-primary' : 'bg-gray-300'}"
						></div>
					{/each}
				</div>
				<span class="ml-3 text-sm text-gray-600">Стъпка {currentStep} от {steps.length}</span>
			</div>

			<!-- Mobile Step Content -->
			<div class="mb-6 flex-1 overflow-y-auto">
				{@html renderStepContent()}
			</div>

			<!-- Mobile Navigation -->
			<div class="flex gap-3 border-t border-gray-200 pt-4">
				{#if currentStep > 1}
					<button
						onclick={prevStep}
						class="flex-1 rounded-lg border border-gray-300 py-3 text-gray-600 hover:text-gray-900"
					>
						Назад
					</button>
				{/if}

				{#if currentStep < 4}
					<button
						onclick={nextStep}
						disabled={!canProceed()}
						class="bg-primary hover:bg-primary/90 flex-1 rounded-lg py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
					>
						{currentStep === 3 ? 'Прегледай' : 'Напред'}
					</button>
				{:else}
					<button
						onclick={handleSubmit}
						class="flex-1 rounded-lg bg-green-600 py-3 text-white hover:bg-green-700"
					>
						Публикувай
					</button>
				{/if}
			</div>
		</Sheet.Content>
	</Sheet.Root>
{/if}
