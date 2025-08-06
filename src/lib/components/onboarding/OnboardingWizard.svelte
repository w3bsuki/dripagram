<script lang="ts">
	import { getContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/utils/toast';
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { UserCircle, CreditCard, Settings } from '@lucide/svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/supabase/types';

	import OnboardingProgress from './OnboardingProgress.svelte';
	import OnboardingNavigation from './OnboardingNavigation.svelte';
	import OnboardingStep from './OnboardingStep.svelte';
	import ProfileSetupStep from './ProfileSetupStep.svelte';
	import PayoutSetupStep from './PayoutSetupStep.svelte';
	import PreferencesStep from './PreferencesStep.svelte';

	import type {
		OnboardingStep as Step,
		OnboardingData,
		ProfileData,
		BrandData,
		PayoutData,
		Preferences,
	} from './types.js';

	const supabase = getContext<SupabaseClient<Database>>('supabase');
	const auth = getAuthContext();

	let currentStep = $state(0);
	let loading = $state(false);

	// Initialize data with proper defaults
	let onboardingData = $state<OnboardingData>({
		profile: {
			full_name: '',
			phone: '',
			address: {
				street: '',
				city: '',
				postal_code: '',
				country: 'България',
			},
			bio: '',
			website: '',
			social_links: {
				instagram: '',
				facebook: '',
				twitter: '',
			},
		},
		brand: {
			brand_description: '',
			brand_website: '',
			brand_category: '',
		},
		payout: {
			method: '',
			bank_name: '',
			iban: '',
			account_holder: '',
		},
		preferences: {
			newsletter: true,
			notifications: {
				email: true,
				push: true,
				sms: false,
			},
			privacy: {
				show_online_status: true,
				show_location: false,
			},
		},
	});

	let steps = $state<Step[]>([
		{
			id: 'profile',
			title: 'Complete Your Profile',
			description: 'Add your personal information',
			icon: UserCircle,
			completed: false,
		},
		{
			id: 'payout',
			title: 'Payout Method',
			description: "How you'll receive payments",
			icon: CreditCard,
			completed: false,
		},
		{
			id: 'preferences',
			title: 'Preferences',
			description: 'Customize your experience',
			icon: Settings,
			completed: false,
		},
	]);

	const isBrand = $derived((auth.user as any)?.account_type === 'brand');
	const isLastStep = $derived(currentStep === steps.length - 1);

	// Validation functions
	function isProfileStepValid(): boolean {
		const { profile, brand } = onboardingData;
		const basicValid = profile.full_name.trim() !== '' && profile.phone.trim() !== '';

		if (isBrand) {
			return basicValid && brand.brand_category !== '' && brand.brand_description.trim() !== '';
		}

		return basicValid;
	}

	function isPayoutStepValid(): boolean {
		const { payout } = onboardingData;
		if (payout.method === '') return false;

		if (payout.method === 'bank') {
			return (
				payout.bank_name.trim() !== '' &&
				payout.iban.trim() !== '' &&
				payout.account_holder.trim() !== ''
			);
		}

		return true;
	}

	function isCurrentStepValid(): boolean {
		switch (currentStep) {
			case 0:
				return isProfileStepValid();
			case 1:
				return isPayoutStepValid();
			case 2:
				return true; // Preferences are optional
			default:
				return false;
		}
	}

	function nextStep() {
		if (!isCurrentStepValid()) {
			toast.error('Please fill in all required fields');
			return;
		}

		if (currentStep < steps.length - 1) {
			steps[currentStep].completed = true;
			currentStep++;
		} else {
			completeOnboarding();
		}
	}

	function previousStep() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	async function completeOnboarding() {
		loading = true;

		try {
			const { profile, brand, payout, preferences } = onboardingData;

			// Update profile
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					full_name: profile.full_name,
					phone: profile.phone,
					address: profile.address,
					bio: profile.bio,
					website: profile.website,
					social_links: profile.social_links,
					payout_method: payout,
					preferences: preferences,
					onboarding_completed: true,
					...(isBrand && {
						brand_description: brand.brand_description,
						brand_website: brand.brand_website,
						brand_category: brand.brand_category,
					}),
				})
				.eq('id', auth.user!.id);

			if (profileError) throw profileError;

			// Update onboarding progress
			const { error: onboardingError } = await supabase
				.from('user_onboarding')
				.update({
					profile_completed: true,
					payout_method_added: true,
					preferences_set: true,
					completed_at: new Date().toISOString(),
				})
				.eq('user_id', auth.user!.id);

			if (onboardingError) throw onboardingError;

			toast.success('Welcome to Driplo! Your profile is all set up.');
			await goto('/');
		} catch (error) {
			console.error('Onboarding error:', error);
			toast.error('Failed to complete onboarding. Please try again.');
		} finally {
			loading = false;
		}
	}

	function skipOnboarding() {
		goto('/');
	}
</script>

<div class="onboarding-container">
	<div class="onboarding-header">
		<a href="/" class="logo">driplo</a>
		<button class="skip-btn" onclick={skipOnboarding}> Skip for now </button>
	</div>

	<OnboardingProgress {steps} {currentStep} />

	<div class="step-content">
		{#if currentStep === 0}
			<OnboardingStep
				title="Complete Your Profile"
				description="Help buyers and sellers get to know you better"
			>
				<ProfileSetupStep
					profileData={onboardingData.profile}
					brandData={onboardingData.brand}
					{isBrand}
				/>
			</OnboardingStep>
		{:else if currentStep === 1}
			<OnboardingStep
				title="Set Up Payout Method"
				description="Choose how you'd like to receive payments for your sales"
			>
				<PayoutSetupStep payoutData={onboardingData.payout} />
			</OnboardingStep>
		{:else if currentStep === 2}
			<OnboardingStep
				title="Customize Your Experience"
				description="Choose how you want to use Driplo"
			>
				<PreferencesStep preferences={onboardingData.preferences} />
			</OnboardingStep>
		{/if}
	</div>

	<OnboardingNavigation
		{currentStep}
		totalSteps={steps.length}
		canGoNext={isCurrentStepValid()}
		{loading}
		{isLastStep}
		onNext={nextStep}
		onPrevious={previousStep}
	/>
</div>

<style>
	.onboarding-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.onboarding-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
	}

	.logo {
		font-size: 2rem;
		font-weight: 800;
		background: linear-gradient(
			135deg,
			var(--color-interactive-primary),
			var(--color-interactive-primary)
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		text-decoration: none;
	}

	.skip-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		text-decoration: underline;
	}

	.step-content {
		margin-bottom: 3rem;
	}

	@media (max-width: 640px) {
		.onboarding-container {
			padding: 1rem;
		}
	}
</style>
