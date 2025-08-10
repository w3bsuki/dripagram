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
  
  // Form data
  let formData = $state({
    username: '',
    account_type: '' as 'personal' | 'brand',
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
      .single();

    if (existing) {
      errors.username = m['onboarding.username.error_taken']();
      return false;
    }

    errors.username = '';
    return true;
  }

  // Step navigation
  async function nextStep() {
    if (currentStep === 1) {
      const isValid = await validateUsername();
      if (!isValid) return;
    }

    if (currentStep === 2) {
      if (!formData.account_type) {
        errors.account_type = m['onboarding.account_type.error_required']();
        return;
      }
      errors.account_type = '';
    }

    if (currentStep === 3) {
      if (!formData.payout_method) {
        errors.payout_method = m['onboarding.payout.error_method_required']();
        return;
      }
      if (!formData.payout_details) {
        errors.payout_details = m['onboarding.payout.error_details_required']();
        return;
      }
      errors.payout_method = '';
      errors.payout_details = '';
    }

    if (currentStep < 4) {
      currentStep++;
    } else {
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
    isLoading = true;

    try {
      const user = data.user;
      
      // Clean social links - remove empty ones
      const socialLinks = Object.fromEntries(
        Object.entries(formData.social_links).filter(([_, value]) => value.trim() !== '')
      );

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username.toLowerCase(),
          account_type: formData.account_type,
          social_links: socialLinks,
          bio: formData.bio,
          region: formData.region,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Save payout information (encrypted in real app)
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          payout_method: formData.payout_method,
          payout_details: formData.payout_details, // Should be encrypted in production
          updated_at: new Date().toISOString()
        });

      // Update user preferences
      const { error: preferencesError } = await supabase.rpc('sync_cookie_preferences', {
        p_user_id: user.id,
        p_locale: 'bg-BG', // Default to Bulgarian
        p_region: formData.region
      });

      if (preferencesError) throw preferencesError;

      // Show success screen
      showSuccess = true;
      
      // Auto redirect to main page after 3 seconds
      setTimeout(() => {
        toast.success(m['onboarding.welcome_toast']());
        goto('/');
      }, 3000);
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      isLoading = false;
    }
  }

  // Handle social link changes
  function updateSocialLink(platform: keyof typeof formData.social_links, value: string) {
    formData.social_links[platform] = value;
  }

  // Navigation from success screen
  async function goToHome() {
    toast.success(m['onboarding.welcome_toast']());
    await goto('/');
  }

  async function goToSell() {
    toast.success(m['onboarding.welcome_toast']());
    await goto('/sell');
  }
</script>

<svelte:head>
  <title>Welcome to Driplo - Complete Your Profile</title>
  <meta name="description" content="Complete your Driplo profile to start buying and selling fashion" />
</svelte:head>

<div class="onboarding-container">
  {#if showSuccess}
    <!-- Success Screen -->
    <div class="success-container">
      <div class="success-content">
        <div class="success-header">
          <div class="success-icon">
            <CheckCircle />
          </div>
          <h1>{m['onboarding.success.title']()}</h1>
          <p class="success-subtitle">{m['onboarding.success.subtitle']()}</p>
          <p class="welcome-message">{m['onboarding.success.welcome_message']()}</p>
        </div>

        <div class="next-steps">
          <h2>{m['onboarding.success.what_next_title']()}</h2>
          <div class="steps-list">
            <div class="step-item">
              <Sparkles class="step-icon" />
              <span>{m['onboarding.success.next_step_1']()}</span>
            </div>
            <div class="step-item">
              <Heart class="step-icon" />
              <span>{m['onboarding.success.next_step_2']()}</span>
            </div>
            <div class="step-item">
              <TrendingUp class="step-icon" />
              <span>{m['onboarding.success.next_step_3']()}</span>
            </div>
          </div>
        </div>

        <div class="success-actions">
          <button class="btn-secondary" onclick={goToHome}>
            {m['onboarding.success.start_exploring']()}
            <Sparkles />
          </button>
          <button class="btn-primary" onclick={goToSell}>
            {m['onboarding.success.go_to_sell']()}
            <TrendingUp />
          </button>
        </div>
      </div>
    </div>
  {:else}
    <!-- Regular Onboarding Flow -->
    <!-- Header -->
    <div class="header">
      <a href="/" class="logo">
        <Sparkles class="logo-icon" />
        <span>driplo</span>
      </a>
      
      <div class="progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {(currentStep / 4) * 100}%"></div>
        </div>
        <span class="progress-text">{m['onboarding.step_counter']({ current: currentStep, total: 4 })}</span>
      </div>
    </div>

    <!-- Main Content -->
  <div class="content">
    <div class="step-header">
      {#if currentStepInfo}
        {@const Icon = currentStepInfo.icon}
        <div class="step-icon">
          <Icon />
        </div>
      {/if}
      {#if currentStepInfo}
        <h1>{currentStepInfo.title}</h1>
        <p>{currentStepInfo.subtitle}</p>
      {/if}
    </div>

    <div class="step-content">
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

          <label class="account-option" class:selected={formData.account_type === 'brand'}>
            <input
              type="radio"
              bind:group={formData.account_type}
              value="brand"
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
    <div class="navigation">
      {#if currentStep > 1}
        <button class="btn-secondary" onclick={previousStep} disabled={isLoading}>
          <ChevronLeft />
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
          <CheckCircle />
        {:else}
          {m['onboarding.actions.continue']()}
          <ChevronRight />
        {/if}
      </button>
    </div>
  </div>
  {/if}
</div>

<style>
  .onboarding-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0.5rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem 0;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: 800;
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .progress {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }

  .progress-bar {
    width: 100px;
    height: 3px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: white;
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .progress-text {
    color: white;
    font-size: 0.625rem;
    opacity: 0.8;
  }

  .content {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .step-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .step-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--color-primary), #6c63ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: white;
  }

  .step-icon :global(svg) {
    width: 1.5rem;
    height: 1.5rem;
  }

  .step-header h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .step-header p {
    color: var(--color-text-secondary);
    font-size: 1rem;
  }

  .step-content {
    margin-bottom: 2rem;
  }

  /* Step 1: Username */
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group label {
    display: block;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .username-input {
    display: flex;
    align-items: center;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    padding: 0 1rem;
    transition: border-color 0.2s ease;
  }

  .username-input:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
  }

  .username-input.error {
    border-color: var(--color-danger);
  }

  .username-prefix {
    color: var(--color-text-muted);
    font-weight: 600;
    margin-right: 0.25rem;
  }

  .username-input input {
    flex: 1;
    border: none;
    background: none;
    padding: 0.75rem 0;
    font-size: 1rem;
    outline: none;
  }

  .username-tips {
    background: var(--color-surface);
    border-radius: 12px;
    padding: 1rem;
  }

  .username-tips h4 {
    color: var(--color-text-primary);
    margin-bottom: 1rem;
  }

  .username-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .username-tips li {
    color: var(--color-text-secondary);
    padding: 0.25rem 0;
    position: relative;
    padding-left: 1.5rem;
  }

  .username-tips li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--color-success);
    font-weight: bold;
  }

  /* Step 2: Account Type */
  .account-types {
    display: grid;
    gap: 1rem;
  }

  .account-option {
    cursor: pointer;
    border: 2px solid var(--color-border);
    border-radius: 16px;
    padding: 0;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .account-option:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .account-option.selected {
    border-color: var(--color-primary);
    background: rgba(24, 119, 242, 0.02);
  }

  .account-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-content {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    align-items: flex-start;
  }

  .option-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--color-primary), #6c63ff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .option-icon :global(svg) {
    width: 1.25rem;
    height: 1.25rem;
  }

  .option-text h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .option-text p {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .option-text ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .option-text li {
    color: var(--color-text-muted);
    font-size: 0.875rem;
    padding: 0.25rem 0;
    position: relative;
    padding-left: 1.25rem;
  }

  .option-text li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--color-primary);
  }

  /* Step 3: Payout Section */
  .payout-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .payout-methods {
    display: grid;
    gap: 1rem;
  }

  .payout-option {
    cursor: pointer;
    border: 2px solid var(--color-border);
    border-radius: 16px;
    padding: 0;
    transition: all 0.2s ease;
    overflow: hidden;
  }

  .payout-option:hover {
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .payout-option.selected {
    border-color: var(--color-primary);
    background: rgba(24, 119, 242, 0.02);
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
    color: var(--color-text-primary);
  }

  .payout-input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    font-size: 0.875rem;
    background: var(--color-surface);
    transition: all 0.2s ease;
  }

  .payout-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
  }

  /* Step 4: Final Step */
  .final-step {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .social-links h3 {
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .optional {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-weight: normal;
  }

  .social-links p {
    color: var(--color-text-secondary);
    margin-bottom: 1.5rem;
  }

  .social-inputs {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .social-input {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 2px solid var(--color-border);
    border-radius: 12px;
    transition: border-color 0.2s ease;
  }

  .social-input:focus-within {
    border-color: var(--color-primary);
  }

  .social-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .social-icon.tiktok {
    font-size: 1.25rem;
  }

  .social-input input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    font-size: 1rem;
  }

  .platform-benefits h3 {
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .benefit {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 12px;
  }

  .benefit-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .benefit-text h4 {
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .benefit-text p {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* Navigation */
  .navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .btn-secondary,
  .btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text-secondary);
  }

  .btn-secondary:hover {
    background: var(--color-gray-200);
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-primary), #6c63ff);
    color: white;
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(24, 119, 242, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-primary :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .btn-secondary :global(svg) {
    width: 1rem;
    height: 1rem;
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
    color: var(--color-danger);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .onboarding-container {
      padding: 0.25rem;
    }

    .header {
      padding: 0.75rem 0;
    }

    .logo {
      font-size: 1rem;
    }

    .logo-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .progress-bar {
      width: 80px;
      height: 2px;
    }

    .progress-text {
      font-size: 0.5rem;
    }

    .content {
      padding: 1.5rem 1rem;
      border-radius: 16px;
    }

    .step-header {
      margin-bottom: 1.5rem;
    }

    .step-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 0.75rem;
    }

    .step-icon :global(svg) {
      width: 1.25rem;
      height: 1.25rem;
    }

    .step-header h1 {
      font-size: 1.25rem;
    }

    .step-header p {
      font-size: 0.875rem;
    }

    .step-content {
      margin-bottom: 1.5rem;
    }

    .form-section {
      gap: 1rem;
    }

    .username-tips {
      padding: 0.75rem;
    }

    .account-types {
      gap: 0.75rem;
    }

    .option-content {
      padding: 1rem;
      gap: 0.75rem;
    }

    .option-icon {
      width: 40px;
      height: 40px;
    }

    .option-icon :global(svg) {
      width: 1rem;
      height: 1rem;
    }

    .option-text h3 {
      font-size: 1rem;
    }

    .option-text p {
      font-size: 0.875rem;
    }

    .option-text li {
      font-size: 0.75rem;
    }

    .payout-section {
      gap: 1rem;
    }

    .final-step {
      gap: 1.5rem;
    }

    .social-input {
      padding: 0.625rem;
    }

    .social-icon {
      width: 1rem;
      height: 1rem;
    }

    .social-input input {
      font-size: 0.875rem;
    }

    .benefits-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .benefit {
      padding: 0.75rem;
    }

    .benefit-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .benefit-text h4 {
      font-size: 0.875rem;
    }

    .benefit-text p {
      font-size: 0.75rem;
    }

    .navigation {
      flex-direction: column-reverse;
      gap: 0.75rem;
    }

    .btn-secondary,
    .btn-primary {
      width: 100%;
      justify-content: center;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }

    .btn-primary :global(svg),
    .btn-secondary :global(svg) {
      width: 1rem;
      height: 1rem;
    }
  }

  /* Success Screen Styles */
  .success-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }

  .success-content {
    max-width: 600px;
    background: white;
    border-radius: 20px;
    padding: 3rem 2rem;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .success-header {
    margin-bottom: 3rem;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #10b981, #34d399);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
  }

  .success-icon :global(svg) {
    width: 2.5rem;
    height: 2.5rem;
  }

  .success-header h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }

  .success-subtitle {
    font-size: 1.125rem;
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .welcome-message {
    color: var(--color-text-muted);
    line-height: 1.6;
    font-size: 1rem;
  }

  .next-steps {
    margin-bottom: 3rem;
  }

  .next-steps h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 1.5rem;
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .step-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-surface);
    border-radius: 12px;
    text-align: left;
  }

  .step-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .success-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .success-actions .btn-secondary,
  .success-actions .btn-primary {
    flex: 1;
    max-width: 200px;
  }

  @media (max-width: 640px) {
    .success-content {
      padding: 2rem 1.5rem;
    }

    .success-icon {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;
    }

    .success-icon :global(svg) {
      width: 2rem;
      height: 2rem;
    }

    .success-header h1 {
      font-size: 1.5rem;
    }

    .success-subtitle {
      font-size: 1rem;
    }

    .welcome-message {
      font-size: 0.875rem;
    }

    .next-steps h2 {
      font-size: 1.25rem;
    }

    .step-item {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .step-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .success-actions {
      flex-direction: column;
    }

    .success-actions .btn-secondary,
    .success-actions .btn-primary {
      max-width: none;
    }
  }
</style>