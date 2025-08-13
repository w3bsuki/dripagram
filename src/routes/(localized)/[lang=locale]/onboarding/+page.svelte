<script lang="ts">
  import { createClient } from '$lib/supabase/client';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/utils/toast';
  import { browser } from '$app/environment';
  import { 
    ChevronRight, 
    ChevronLeft,
    User, 
    Building2, 
    Instagram, 
    Facebook,
    CheckCircle,
    Sparkles,
    Shield,
    Zap,
    Heart,
    TrendingUp,
    CreditCard,
    Wallet
  } from '@lucide/svelte';
  import * as m from '$lib/paraglide/messages';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  
  const supabase = createClient();
  
  // Onboarding state
  let currentStep = $state(1);
  let isLoading = $state(false);
  let showSuccess = $state(false);
  let welcomeStep = $state(0); // 0 = onboarding, 1-3 = welcome screens
  
  // Form data
  let formData = $state({
    username: '',
    account_type: '' as 'personal' | 'business',
    payout_method: '' as 'revolut' | 'paypal' | 'card' | '',
    payout_details: '',
    social_links: {
      instagram: '',
      facebook: '',
      tiktok: ''
    },
    bio: '',
    region: 'sofia' // Default region for Bulgaria
  });

  // Validation
  let errors = $state<Record<string, string>>({});

  const steps = [
    {
      id: 1,
      title: m['onboarding.username.title'](),
      subtitle: m['onboarding.username.subtitle'](),
      icon: User
    },
    {
      id: 2,
      title: m['onboarding.account_type.title'](),
      subtitle: m['onboarding.account_type.subtitle'](),
      icon: Building2
    },
    {
      id: 3,
      title: m['onboarding.payout.title'](),
      subtitle: m['onboarding.payout.subtitle'](),
      icon: Wallet
    },
    {
      id: 4,
      title: m['onboarding.social.title'](),
      subtitle: m['onboarding.social.subtitle'](),
      icon: Sparkles
    }
  ];

  let currentStepInfo = $derived(steps.find(s => s.id === currentStep)!);

  // Platform benefits for step 4
  const benefits = [
    {
      icon: Shield,
      title: m['onboarding.social.benefit_protection_title'](),
      description: m['onboarding.social.benefit_protection_desc']()
    },
    {
      icon: Zap,
      title: m['onboarding.social.benefit_fees_title'](),
      description: m['onboarding.social.benefit_fees_desc']()
    },
    {
      icon: Heart,
      title: m['onboarding.social.benefit_community_title'](),
      description: m['onboarding.social.benefit_community_desc']()
    },
    {
      icon: TrendingUp,
      title: m['onboarding.social.benefit_growth_title'](),
      description: m['onboarding.social.benefit_growth_desc']()
    }
  ];

  // Username validation
  async function validateUsername() {
    if (!formData.username) {
      errors.username = m['onboarding.username.error_required']();
      return false;
    }

    if (formData.username.length < 3) {
      errors.username = m['onboarding.username.error_short']();
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = m['onboarding.username.error_invalid']();
      return false;
    }

    // Check if username exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', formData.username.toLowerCase())
      .maybeSingle();

    if (existing) {
      errors.username = m['onboarding.username.error_taken']();
      return false;
    }

    errors.username = '';
    return true;
  }

  // Step navigation
  async function nextStep() {
    console.log('nextStep called, currentStep:', currentStep, 'formData:', formData);
    console.log('Account type:', formData.account_type);
    
    if (currentStep === 1) {
      const isValid = await validateUsername();
      if (!isValid) return;
    }

    if (currentStep === 2) {
      console.log('Step 2 validation - account_type:', formData.account_type);
      if (!formData.account_type) {
        console.log('Account type validation failed - no account type selected');
        errors.account_type = m['onboarding.account_type.error_required']();
        return;
      }
      console.log('Account type validation passed');
      errors.account_type = '';
    }

    if (currentStep === 3) {
      // Payout is optional - users can set this up later in settings
      // Only validate if they started filling it out
      if (formData.payout_method && !formData.payout_details) {
        errors.payout_details = m['onboarding.payout.error_details_required']();
        return;
      }
      errors.payout_method = '';
      errors.payout_details = '';
    }

    if (currentStep < 4) {
      currentStep++;
    } else {
      console.log('About to call completeOnboarding(), account_type:', formData.account_type);
      await completeOnboarding();
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  // Complete onboarding
  async function completeOnboarding() {
    console.log('Starting onboarding completion...', { formData });
    isLoading = true;

    try {
      const user = data.user;
      
      // Clean social links - remove empty ones
      const socialLinks = Object.fromEntries(
        Object.entries(formData.social_links).filter(([_, value]) => value.trim() !== '')
      );

      // Prepare profile data - creating profile for the first time
      const profileData: any = {
        id: user.id,
        username: formData.username.toLowerCase(),
        full_name: user.user_metadata?.full_name || '',
        account_type: formData.account_type,
        bio: formData.bio,
        social_links: socialLinks,
        region: formData.region,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add brand-specific fields if it's a business account
      if (formData.account_type === 'business') {
        profileData.brand_name = formData.username;
      }

      // Create or update profile using upsert  
      console.log('Creating profile with data:', profileData);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        
        // Handle specific username duplicate error
        if (profileError.message.includes('profiles_username_key') || profileError.message.includes('duplicate key')) {
          errors.username = m['onboarding.username.error_taken']();
          currentStep = 1; // Go back to username step
          isLoading = false;
          return;
        }
        
        throw new Error(`Profile update failed: ${profileError.message}`);
      }
      
      // Note: Payout and preferences will be saved later in settings
      // For now, just complete the profile creation to get user into the app

      // Show welcome overlay screens
      welcomeStep = 1;
      
    } catch (error) {
      console.error('Onboarding error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(errorMessage);
    } finally {
      isLoading = false;
    }
  }

  // Handle social link changes
  function updateSocialLink(platform: keyof typeof formData.social_links, value: string) {
    formData.social_links[platform] = value;
  }

  // Welcome screen navigation
  function nextWelcomeStep() {
    if (welcomeStep < 3) {
      welcomeStep++;
    } else {
      finishWelcome();
    }
  }

  function finishWelcome() {
    toast.success(m['onboarding.welcome_toast']());
    goto('/');
  }

  // Get display name for welcome
  function getDisplayName() {
    if (formData.account_type === 'business' && formData.username) {
      return formData.username.toUpperCase();
    }
    return data.user?.user_metadata?.full_name || formData.username;
  }
</script>

<svelte:head>
  <title>Welcome to Driplo - Complete Your Profile</title>
  <meta name="description" content="Complete your Driplo profile to start buying and selling fashion" />
</svelte:head>

<div class="onboarding">
  {#if welcomeStep > 0}
    <div class="welcome-overlay" onclick={(e) => e.target === e.currentTarget && nextWelcomeStep()}>
      <div class="welcome-content">
        {#if welcomeStep === 1}
          <div class="welcome-icon">
            ✨
          </div>
          <h1>Welcome {getDisplayName()}!</h1>
          <p>You're all set! Ready to discover the best fashion deals?</p>
        {:else if welcomeStep === 2}
          <div class="welcome-icon">
            🛍️
          </div>
          <h1>Buy & Sell Fashion</h1>
          <p>List your items for free and discover unique pieces from our community</p>
        {:else if welcomeStep === 3}
          <div class="welcome-icon">
            🛡️
          </div>
          <h1>Safe & Secure</h1>
          <p>Only 5% transaction fee. Buyer protection guaranteed on every purchase.</p>
        {/if}
        
        <button class="btn-primary welcome-btn" onclick={nextWelcomeStep}>
          {#if welcomeStep === 3}
            Let's Go!
          {:else}
            Next
          {/if}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  {:else}
    <div class="onboarding-header">
      <a href="/" class="logo">driplo</a>
      <span class="step-indicator">{currentStep}/4</span>
    </div>

    <div class="onboarding-content">
      <div class="step-title">
        <h1>{currentStepInfo?.title}</h1>
        <p>{currentStepInfo?.subtitle}</p>
      </div>

      <div class="step-form">
      {#if currentStep === 1}
        <!-- Step 1: Username -->
        <div class="form-section">
          <div class="input-group">
            <label for="username">{m['onboarding.username.label']()}</label>
            <div class="username-input">
              <span class="username-prefix">@</span>
              <input
                id="username"
                type="text"
                bind:value={formData.username}
                placeholder={m['onboarding.username.placeholder']()}
                class:error={errors.username}
                maxlength="30"
              />
            </div>
            {#if errors.username}
              <span class="error-text">{errors.username}</span>
            {/if}
          </div>
          
          <div class="username-tips">
            <h4>{m['onboarding.username.tips_title']()}</h4>
            <ul>
              <li>{m['onboarding.username.tip_1']()}</li>
              <li>{m['onboarding.username.tip_2']()}</li>
              <li>{m['onboarding.username.tip_3']()}</li>
              <li>{m['onboarding.username.tip_4']()}</li>
            </ul>
          </div>
        </div>

      {:else if currentStep === 2}
        <!-- Step 2: Account Type -->
        <div class="account-types">
          <label class="account-option" class:selected={formData.account_type === 'personal'}>
            <input
              type="radio"
              bind:group={formData.account_type}
              value="personal"
            />
            <div class="option-content">
              <div class="option-icon">
                <User />
              </div>
              <div class="option-text">
                <h3>{m['onboarding.account_type.personal_title']()}</h3>
                <p>{m['onboarding.account_type.personal_subtitle']()}</p>
                <ul>
                  <li>{m['onboarding.account_type.personal_benefit_1']()}</li>
                  <li>{m['onboarding.account_type.personal_benefit_2']()}</li>
                  <li>{m['onboarding.account_type.personal_benefit_3']()}</li>
                </ul>
              </div>
            </div>
          </label>

          <label class="account-option" class:selected={formData.account_type === 'business'}>
            <input
              type="radio"
              bind:group={formData.account_type}
              value="business"
            />
            <div class="option-content">
              <div class="option-icon">
                <Building2 />
              </div>
              <div class="option-text">
                <h3>{m['onboarding.account_type.brand_title']()}</h3>
                <p>{m['onboarding.account_type.brand_subtitle']()}</p>
                <ul>
                  <li>{m['onboarding.account_type.brand_benefit_1']()}</li>
                  <li>{m['onboarding.account_type.brand_benefit_2']()}</li>
                  <li>{m['onboarding.account_type.brand_benefit_3']()}</li>
                </ul>
              </div>
            </div>
          </label>
        </div>

        {#if errors.account_type}
          <span class="error-text">{errors.account_type}</span>
        {/if}

      {:else if currentStep === 3}
        <!-- Step 3: Payout Method -->
        <div class="payout-section">
          <div class="payout-methods">
            <label class="payout-option" class:selected={formData.payout_method === 'revolut'}>
              <input
                type="radio"
                bind:group={formData.payout_method}
                value="revolut"
              />
              <div class="option-content">
                <div class="option-icon" style="background: linear-gradient(135deg, #191726, #2e2c3f);">
                  <Wallet />
                </div>
                <div class="option-text">
                  <h3>{m['onboarding.payout.revolut_title']()}</h3>
                  <p>{m['onboarding.payout.revolut_subtitle']()}</p>
                </div>
              </div>
            </label>

            <label class="payout-option" class:selected={formData.payout_method === 'paypal'}>
              <input
                type="radio"
                bind:group={formData.payout_method}
                value="paypal"
              />
              <div class="option-content">
                <div class="option-icon" style="background: linear-gradient(135deg, #003087, #009cde);">
                  <Wallet />
                </div>
                <div class="option-text">
                  <h3>{m['onboarding.payout.paypal_title']()}</h3>
                  <p>{m['onboarding.payout.paypal_subtitle']()}</p>
                </div>
              </div>
            </label>

            <label class="payout-option" class:selected={formData.payout_method === 'card'}>
              <input
                type="radio"
                bind:group={formData.payout_method}
                value="card"
              />
              <div class="option-content">
                <div class="option-icon">
                  <CreditCard />
                </div>
                <div class="option-text">
                  <h3>{m['onboarding.payout.card_title']()}</h3>
                  <p>{m['onboarding.payout.card_subtitle']()}</p>
                </div>
              </div>
            </label>
          </div>

          {#if formData.payout_method}
            <div class="payout-details">
              <label for="payout_details">
                {#if formData.payout_method === 'revolut'}
                  {m['onboarding.payout.revolut_label']()}
                {:else if formData.payout_method === 'paypal'}
                  {m['onboarding.payout.paypal_label']()}
                {:else}
                  {m['onboarding.payout.card_label']()}
                {/if}
              </label>
              <input
                id="payout_details"
                type="text"
                bind:value={formData.payout_details}
                placeholder={
                  formData.payout_method === 'revolut' ? m['onboarding.payout.revolut_placeholder']() :
                  formData.payout_method === 'paypal' ? m['onboarding.payout.paypal_placeholder']() :
                  m['onboarding.payout.card_placeholder']()
                }
                class="payout-input"
              />
            </div>
          {/if}

          {#if errors.payout_method}
            <span class="error-text">{errors.payout_method}</span>
          {/if}
          {#if errors.payout_details}
            <span class="error-text">{errors.payout_details}</span>
          {/if}
        </div>

      {:else if currentStep === 4}
        <!-- Step 4: Social Links & Launch -->
        <div class="final-step">
          <div class="social-links">
            <h3>{m['onboarding.social.connect_title']()} <span class="optional">({m['onboarding.social.optional']()})</span></h3>
            <p>{m['onboarding.social.connect_subtitle']()}</p>
            
            <div class="social-inputs">
              <div class="social-input">
                <Instagram class="social-icon" />
                <input
                  type="text"
                  placeholder={m['onboarding.social.instagram_placeholder']()}
                  bind:value={formData.social_links.instagram}
                />
              </div>
              
              <div class="social-input">
                <Facebook class="social-icon" />
                <input
                  type="text"
                  placeholder={m['onboarding.social.facebook_placeholder']()}
                  bind:value={formData.social_links.facebook}
                />
              </div>
              
              <div class="social-input">
                <span class="social-icon tiktok">🎵</span>
                <input
                  type="text"
                  placeholder={m['onboarding.social.tiktok_placeholder']()}
                  bind:value={formData.social_links.tiktok}
                />
              </div>
            </div>
          </div>

          <div class="platform-benefits">
            <h3>{m['onboarding.social.benefits_title']()}</h3>
            <div class="benefits-grid">
              {#each benefits as benefit}
                {@const BenefitIcon = benefit.icon}
                <div class="benefit">
                  <BenefitIcon class="benefit-icon" />
                  <div class="benefit-text">
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}
      </div>

      <!-- Navigation -->
      <div class="step-navigation">
        {#if currentStep > 1}
          <button class="btn-secondary" onclick={previousStep} disabled={isLoading}>
            <ChevronLeft size={16} />
            {m['onboarding.actions.back']()}
          </button>
        {:else}
          <div></div>
        {/if}

        <button class="btn-primary" onclick={nextStep} disabled={isLoading}>
          {#if isLoading}
            <div class="spinner"></div>
            {m['onboarding.actions.setting_up']()}
          {:else if currentStep === 4}
            {m['onboarding.actions.complete']()}
            <CheckCircle size={16} />
          {:else}
            {m['onboarding.actions.continue']()}
            <ChevronRight size={16} />
          {/if}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .onboarding {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .onboarding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
    padding: 1rem 0;
  }

  .logo {
    display: flex;
    align-items: center;
    color: #000000;
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .step-indicator {
    color: #666666;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .onboarding-content {
    max-width: 480px;
    margin: 0 auto;
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .step-title {
    text-align: center;
  }

  .step-title h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #000000;
    margin-bottom: 0.5rem;
    line-height: 1.2;
  }

  .step-title p {
    color: #666666;
    font-size: 0.875rem;
    line-height: 1.4;
  }

  .step-form {
    flex: 1;
  }

  /* Step 1: Username */
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group label {
    display: block;
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .username-input {
    display: flex;
    align-items: center;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 0 1rem;
    transition: border-color 0.2s ease;
    height: 44px;
  }

  .username-input:focus-within {
    border-color: #000000;
    outline: 2px solid #000000;
    outline-offset: -1px;
  }

  .username-input.error {
    border-color: #dc2626;
  }

  .username-prefix {
    color: #666666;
    font-weight: 600;
    margin-right: 0.25rem;
  }

  .username-input input {
    flex: 1;
    border: none;
    background: none;
    padding: 0;
    font-size: 1rem;
    outline: none;
    color: #000000;
  }

  .username-tips {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 1rem;
  }

  .username-tips h4 {
    color: #000000;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .username-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .username-tips li {
    color: #666666;
    padding: 0.25rem 0;
    position: relative;
    padding-left: 1.25rem;
    font-size: 0.75rem;
  }

  .username-tips li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #16a34a;
    font-weight: bold;
  }

  /* Step 2: Account Type */
  .account-types {
    display: grid;
    gap: 0.75rem;
  }

  .account-option {
    cursor: pointer;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 0;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .account-option:hover {
    border-color: #000000;
  }

  .account-option.selected {
    border-color: #000000;
    background: #f9f9f9;
  }

  .account-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-content {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    align-items: flex-start;
  }

  .option-icon {
    width: 36px;
    height: 36px;
    background: #000000;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .option-icon :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .option-text h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.25rem;
  }

  .option-text p {
    color: #666666;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .option-text ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .option-text li {
    color: #888888;
    font-size: 0.75rem;
    padding: 0.125rem 0;
    position: relative;
    padding-left: 1rem;
  }

  .option-text li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #000000;
  }

  /* Step 3: Payout Section */
  .payout-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .payout-methods {
    display: grid;
    gap: 0.75rem;
  }

  .payout-option {
    cursor: pointer;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    padding: 0;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .payout-option:hover {
    border-color: #000000;
  }

  .payout-option.selected {
    border-color: #000000;
    background: #f9f9f9;
  }

  .payout-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .payout-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .payout-details label {
    font-weight: 600;
    color: #000000;
    font-size: 0.875rem;
  }

  .payout-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    font-size: 0.875rem;
    background: #ffffff;
    transition: all 0.2s ease;
    height: 44px;
  }

  .payout-input:focus {
    outline: 2px solid #000000;
    outline-offset: -1px;
    border-color: #000000;
  }

  /* Step 4: Final Step */
  .final-step {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .social-links h3 {
    color: #000000;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .optional {
    font-size: 0.75rem;
    color: #888888;
    font-weight: normal;
  }

  .social-links p {
    color: #666666;
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .social-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .social-input {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    transition: border-color 0.2s ease;
    height: 44px;
  }

  .social-input:focus-within {
    border-color: #000000;
    outline: 2px solid #000000;
    outline-offset: -1px;
  }

  .social-icon {
    width: 1rem;
    height: 1rem;
    color: #666666;
    flex-shrink: 0;
  }

  .social-icon.tiktok {
    font-size: 1rem;
  }

  .social-input input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 0.875rem;
    color: #000000;
  }

  .platform-benefits h3 {
    color: #000000;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .benefit {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: 8px;
  }

  .benefit-icon {
    width: 1rem;
    height: 1rem;
    color: #000000;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .benefit-text h4 {
    color: #000000;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.125rem;
  }

  .benefit-text p {
    color: #666666;
    font-size: 0.75rem;
    line-height: 1.3;
  }

  /* Navigation */
  .step-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: auto;
    padding-top: 1.5rem;
  }

  .btn-secondary,
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    min-height: 44px;
  }

  .btn-secondary {
    background: #f9f9f9;
    color: #666666;
    border: 1px solid #e5e5e5;
  }

  .btn-secondary:hover {
    background: #f1f1f1;
    color: #000000;
  }

  .btn-primary {
    background: #000000;
    color: white;
    flex: 1;
  }

  .btn-primary:hover:not(:disabled) {
    background: #333333;
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-text {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    display: block;
  }

  /* Welcome Overlay */
  .welcome-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .welcome-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .welcome-icon {
    width: 80px;
    height: 80px;
    background: #f9f9f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 2rem;
  }

  .welcome-content h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #000;
    margin-bottom: 0.75rem;
  }

  .welcome-content p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
  }

  .welcome-btn {
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }


  /* Mobile optimizations */
  @media (max-width: 640px) {
    .onboarding {
      padding: 0.75rem;
    }

    .onboarding-header {
      padding: 0.75rem 0;
    }

    .logo {
      font-size: 1.25rem;
    }

    .step-indicator {
      font-size: 0.75rem;
    }

    .onboarding-content {
      gap: 1rem;
    }

    .step-title h1 {
      font-size: 1.25rem;
    }

    .step-title p {
      font-size: 0.8125rem;
    }

    .form-section {
      gap: 0.75rem;
    }

    .username-tips {
      padding: 0.75rem;
    }

    .account-types {
      gap: 0.5rem;
    }

    .option-content {
      padding: 0.75rem;
      gap: 0.5rem;
    }

    .option-icon {
      width: 32px;
      height: 32px;
    }

    .option-text h3 {
      font-size: 0.875rem;
    }

    .option-text p {
      font-size: 0.75rem;
    }

    .option-text li {
      font-size: 0.6875rem;
    }

    .payout-section {
      gap: 0.75rem;
    }

    .final-step {
      gap: 1rem;
    }

    .social-input {
      padding: 0.625rem;
      height: 40px;
    }

    .step-navigation {
      padding-top: 1rem;
      gap: 0.75rem;
    }

    .btn-secondary,
    .btn-primary {
      padding: 0.625rem 1rem;
      min-height: 40px;
    }
  }

</style>