<script lang="ts">
	import { getAuthContext } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/utils/toast';
	import {
		UserCircle,
		CreditCard,
		Settings,
		CheckCircle,
		ChevronRight,
		Building2,
		Camera,
		MapPin,
		Phone,
		Globe,
		Instagram,
		Facebook,
		Twitter,
	} from '@lucide/svelte';
	import { createClient } from '$lib/supabase/client';

	const supabase = createClient();
	const auth = getAuthContext();

	interface OnboardingStep {
		id: string;
		title: string;
		description: string;
		icon: any;
		completed: boolean;
	}

	let currentStep = $state(0);
	let loading = $state(false);

	// Profile data
	let profileData = $state({
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
	});

	// Brand specific data
	let brandData = $state({
		brand_description: '',
		brand_website: '',
		brand_category: '',
	});

	// Payout data
	let payoutData = $state({
		method: '',
		bank_name: '',
		iban: '',
		account_holder: '',
	});

	// Preferences
	let preferences = $state({
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
	});

	let steps = $state<OnboardingStep[]>([
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

	const isBrand = auth.user?.user_metadata?.account_type === 'brand';

	function nextStep() {
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
			// Update profile
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					full_name: profileData.full_name,
					phone: profileData.phone,
					address: profileData.address,
					bio: profileData.bio,
					website: profileData.website,
					social_links: profileData.social_links,
					payout_method: payoutData,
					preferences: preferences,
					onboarding_completed: true,
					...(isBrand && {
						brand_description: brandData.brand_description,
						brand_website: brandData.brand_website,
						brand_category: brandData.brand_category,
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

	<!-- Progress Bar -->
	<div class="progress-container">
		<div class="progress-bar">
			<div class="progress-fill" style="width: {((currentStep + 1) / steps.length) * 100}%"></div>
		</div>
		<div class="progress-steps">
			{#each steps as step, index}
				<div
					class="progress-step"
					class:active={index === currentStep}
					class:completed={step.completed}
				>
					<div class="step-icon">
						{#if step.completed}
							<CheckCircle size={20} />
						{:else}
							{@const IconComponent = step.icon}
							<IconComponent size={20} />
						{/if}
					</div>
					<span class="step-label">{step.title}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Step Content -->
	<div class="step-content">
		{#if currentStep === 0}
			<!-- Profile Step -->
			<div class="step-card">
				<h2>Complete Your Profile</h2>
				<p>Help buyers and sellers get to know you better</p>

				<div class="form-section">
					<div class="form-group">
						<label for="full_name">Full Name</label>
						<input
							id="full_name"
							type="text"
							bind:value={profileData.full_name}
							placeholder="John Doe"
							class="input-field"
						/>
					</div>

					<div class="form-group">
						<label for="phone">Phone Number</label>
						<div class="input-wrapper">
							<Phone size={20} class="input-icon" />
							<input
								id="phone"
								type="tel"
								bind:value={profileData.phone}
								placeholder="+359 88 123 4567"
								class="input-field with-icon"
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="bio">Bio</label>
						<textarea
							id="bio"
							bind:value={profileData.bio}
							placeholder="Tell us about yourself..."
							rows="3"
							class="input-field"
						></textarea>
					</div>

					{#if isBrand}
						<div class="brand-section">
							<h3>Brand Information</h3>

							<div class="form-group">
								<label for="brand_category">Category</label>
								<select
									id="brand_category"
									bind:value={brandData.brand_category}
									class="input-field"
								>
									<option value="">Select category</option>
									<option value="Fashion">Fashion</option>
									<option value="Sportswear">Sportswear</option>
									<option value="Accessories">Accessories</option>
									<option value="Footwear">Footwear</option>
									<option value="Luxury">Luxury</option>
									<option value="Streetwear">Streetwear</option>
									<option value="Vintage">Vintage</option>
								</select>
							</div>

							<div class="form-group">
								<label for="brand_description">Brand Description</label>
								<textarea
									id="brand_description"
									bind:value={brandData.brand_description}
									placeholder="What makes your brand special?"
									rows="3"
									class="input-field"
								></textarea>
							</div>

							<div class="form-group">
								<label for="brand_website">Website</label>
								<div class="input-wrapper">
									<Globe size={20} class="input-icon" />
									<input
										id="brand_website"
										type="url"
										bind:value={brandData.brand_website}
										placeholder="https://yourbrand.com"
										class="input-field with-icon"
									/>
								</div>
							</div>
						</div>
					{/if}

					<div class="address-section">
						<h3>Address</h3>
						<div class="form-row">
							<div class="form-group">
								<label for="city">City</label>
								<input
									id="city"
									type="text"
									bind:value={profileData.address.city}
									placeholder="Sofia"
									class="input-field"
								/>
							</div>
							<div class="form-group">
								<label for="postal_code">Postal Code</label>
								<input
									id="postal_code"
									type="text"
									bind:value={profileData.address.postal_code}
									placeholder="1000"
									class="input-field"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		{:else if currentStep === 1}
			<!-- Payout Step -->
			<div class="step-card">
				<h2>Set Up Payout Method</h2>
				<p>Choose how you'd like to receive payments for your sales</p>

				<div class="payout-methods">
					<label class="payout-option">
						<input type="radio" bind:group={payoutData.method} value="bank" name="payout" />
						<div class="option-content">
							<div class="option-icon">🏦</div>
							<div class="option-text">
								<h4>Bank Transfer</h4>
								<p>Direct deposit to your bank account</p>
							</div>
						</div>
					</label>

					<label class="payout-option">
						<input type="radio" bind:group={payoutData.method} value="revolut" name="payout" />
						<div class="option-content">
							<div class="option-icon">💳</div>
							<div class="option-text">
								<h4>Revolut</h4>
								<p>Fast transfers to your Revolut account</p>
							</div>
						</div>
					</label>
				</div>

				{#if payoutData.method === 'bank'}
					<div class="bank-details">
						<div class="form-group">
							<label for="bank_name">Bank Name</label>
							<input
								id="bank_name"
								type="text"
								bind:value={payoutData.bank_name}
								placeholder="UniCredit Bulbank"
								class="input-field"
							/>
						</div>

						<div class="form-group">
							<label for="iban">IBAN</label>
							<input
								id="iban"
								type="text"
								bind:value={payoutData.iban}
								placeholder="BG00 UNCR 0000 0000 0000 00"
								class="input-field"
							/>
						</div>

						<div class="form-group">
							<label for="account_holder">Account Holder Name</label>
							<input
								id="account_holder"
								type="text"
								bind:value={payoutData.account_holder}
								placeholder="As it appears on your bank account"
								class="input-field"
							/>
						</div>
					</div>
				{/if}
			</div>
		{:else if currentStep === 2}
			<!-- Preferences Step -->
			<div class="step-card">
				<h2>Customize Your Experience</h2>
				<p>Choose how you want to use Driplo</p>

				<div class="preferences-section">
					<h3>Notifications</h3>
					<div class="preference-group">
						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.notifications.email} />
							<div class="preference-text">
								<h4>Email Notifications</h4>
								<p>Get updates about your orders and messages</p>
							</div>
						</label>

						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.notifications.push} />
							<div class="preference-text">
								<h4>Push Notifications</h4>
								<p>Real-time alerts on your device</p>
							</div>
						</label>

						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.notifications.sms} />
							<div class="preference-text">
								<h4>SMS Notifications</h4>
								<p>Important updates via text message</p>
							</div>
						</label>
					</div>

					<h3>Privacy</h3>
					<div class="preference-group">
						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.privacy.show_online_status} />
							<div class="preference-text">
								<h4>Show Online Status</h4>
								<p>Let others see when you're active</p>
							</div>
						</label>

						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.privacy.show_location} />
							<div class="preference-text">
								<h4>Show Location</h4>
								<p>Display your city on your profile</p>
							</div>
						</label>
					</div>

					<h3>Marketing</h3>
					<div class="preference-group">
						<label class="preference-item">
							<input type="checkbox" bind:checked={preferences.newsletter} />
							<div class="preference-text">
								<h4>Newsletter</h4>
								<p>Receive tips, trends, and exclusive offers</p>
							</div>
						</label>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Navigation -->
	<div class="navigation">
		{#if currentStep > 0}
			<button class="nav-btn secondary" onclick={previousStep}> Back </button>
		{/if}

		<button class="nav-btn primary" onclick={nextStep} disabled={loading}>
			{#if currentStep === steps.length - 1}
				{loading ? 'Completing...' : 'Complete Setup'}
			{:else}
				Continue
				<ChevronRight size={20} />
			{/if}
		</button>
	</div>
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
		background: linear-gradient(135deg, var(--color-primary), #6c63ff);
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

	.progress-container {
		margin-bottom: 3rem;
	}

	.progress-bar {
		height: 8px;
		background: var(--color-gray-200);
		border-radius: 999px;
		overflow: hidden;
		margin-bottom: 2rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.progress-steps {
		display: flex;
		justify-content: space-between;
	}

	.progress-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.5;
		transition: opacity 0.3s;
	}

	.progress-step.active,
	.progress-step.completed {
		opacity: 1;
	}

	.step-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: var(--color-gray-200);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
		transition: all 0.3s;
	}

	.progress-step.active .step-icon {
		background: var(--color-primary);
		color: white;
	}

	.progress-step.completed .step-icon {
		background: var(--color-success);
		color: white;
	}

	.step-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-align: center;
		max-width: 100px;
	}

	.step-content {
		margin-bottom: 3rem;
	}

	.step-card {
		background: var(--color-background);
		border-radius: 16px;
		padding: 2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
	}

	.step-card h2 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: 0.5rem;
	}

	.step-card > p {
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.input-wrapper {
		position: relative;
	}

	.input-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
	}

	.input-field {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		font-size: 1rem;
		color: var(--color-text-primary);
		transition: all 0.2s;
	}

	.input-field.with-icon {
		padding-left: 3rem;
	}

	.input-field:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
	}

	textarea.input-field {
		resize: vertical;
		min-height: 100px;
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.brand-section,
	.address-section {
		margin-top: 2rem;
	}

	.brand-section h3,
	.address-section h3,
	.preferences-section h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 1rem;
	}

	/* Payout Methods */
	.payout-methods {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.payout-option {
		position: relative;
		cursor: pointer;
	}

	.payout-option input[type='radio'] {
		position: absolute;
		opacity: 0;
	}

	.option-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.5rem;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: 12px;
		transition: all 0.2s;
	}

	.payout-option input:checked + .option-content {
		border-color: var(--color-primary);
		background: rgba(24, 119, 242, 0.05);
	}

	.option-icon {
		font-size: 2rem;
	}

	.option-text h4 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.option-text p {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.bank-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Preferences */
	.preferences-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.preference-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.preference-item {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		cursor: pointer;
		padding: 1rem;
		background: var(--color-surface);
		border-radius: 8px;
		transition: all 0.2s;
	}

	.preference-item:hover {
		background: var(--color-gray-50);
	}

	.preference-item input[type='checkbox'] {
		margin-top: 0.25rem;
	}

	.preference-text h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.25rem;
	}

	.preference-text p {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	/* Navigation */
	.navigation {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.nav-btn {
		padding: 0.75rem 1.5rem;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-btn.primary {
		background: var(--color-primary);
		color: white;
		margin-left: auto;
	}

	.nav-btn.primary:hover:not(:disabled) {
		background: #1567d8;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
	}

	.nav-btn.secondary {
		background: var(--color-gray-100);
		color: var(--color-text-primary);
	}

	.nav-btn.secondary:hover {
		background: var(--color-gray-200);
	}

	.nav-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 640px) {
		.onboarding-container {
			padding: 1rem;
		}

		.step-card {
			padding: 1.5rem;
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.progress-step .step-label {
			font-size: 0.625rem;
		}
	}
</style>
