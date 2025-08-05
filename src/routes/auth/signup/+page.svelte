<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { toast } from '$lib/utils/toast';
  import { Eye, EyeOff, Mail, Lock, User, Building2, UserCircle } from '@lucide/svelte';
  
  let email = $state('');
  let password = $state('');
  let username = $state('');
  let accountType = $state<'personal' | 'brand'>('personal');
  let brandName = $state('');
  let showPassword = $state(false);
  let loading = $state(false);
  let acceptTerms = $state(false);
  
  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    if (accountType === 'brand' && !brandName.trim()) {
      toast.error('Please enter your brand name');
      return;
    }
    
    loading = true;
    
    const { data, error } = await auth.signUp(
      email, 
      password, 
      username, 
      accountType,
      accountType === 'brand' ? brandName : undefined
    );
    
    if (error) {
      toast.error((error as any)?.message || 'Failed to create account');
      loading = false;
    } else {
      toast.success('Account created! Please check your email to verify.');
      
      // Check if onboarding is needed and redirect accordingly
      const needsOnboarding = !data?.user?.user_metadata?.onboarding_completed;
      if (needsOnboarding) {
        await goto('/onboarding');
      } else {
        await goto('/auth/login');
      }
    }
  }

  function selectAccountType(type: 'personal' | 'brand') {
    accountType = type;
    if (type === 'personal') {
      brandName = '';
    }
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <!-- Logo -->
    <a href="/" class="logo">driplo</a>
    
    <!-- Header -->
    <div class="auth-header">
      <h1>Create your account</h1>
      <p>Join Bulgaria's #1 fashion marketplace</p>
    </div>
    
    <!-- Form -->
    <form onsubmit={handleSubmit} class="auth-form">
      <!-- Account Type Selection -->
      <div class="form-group">
        <label for="account-type">Choose your account type</label>
        <div class="account-type-cards" id="account-type" role="radiogroup" aria-labelledby="account-type-label">
          <button
            type="button"
            onclick={() => selectAccountType('personal')}
            class="account-card {accountType === 'personal' ? 'selected' : ''}"
            role="radio"
            aria-checked={accountType === 'personal'}
            aria-labelledby="personal-label"
          >
            <UserCircle size={32} class="account-icon" />
            <div class="account-info">
              <h3 id="personal-label">Personal</h3>
              <p>Buy and sell your own items</p>
            </div>
          </button>
          
          <button
            type="button"
            onclick={() => selectAccountType('brand')}
            class="account-card {accountType === 'brand' ? 'selected' : ''}"
            role="radio"
            aria-checked={accountType === 'brand'}
            aria-labelledby="brand-label"
          >
            <Building2 size={32} class="account-icon" />
            <div class="account-info">
              <h3 id="brand-label">Brand</h3>
              <p>Sell as a business or brand</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Brand Name Field (conditional) -->
      {#if accountType === 'brand'}
        <div class="form-group brand-field">
          <label for="brandName">Brand Name</label>
          <div class="input-wrapper">
            <Building2 size={20} class="input-icon" />
            <input
              id="brandName"
              type="text"
              bind:value={brandName}
              placeholder="Your Brand Name"
              required
              autocomplete="organization"
              class="input-field"
            />
          </div>
        </div>
      {/if}

      <div class="form-group">
        <label for="username">Username</label>
        <div class="input-wrapper">
          <User size={20} class="input-icon" />
          <input
            id="username"
            type="text"
            bind:value={username}
            placeholder="johndoe"
            required
            autocomplete="username"
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores"
            class="input-field"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <div class="input-wrapper">
          <Mail size={20} class="input-icon" />
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="you@example.com"
            required
            autocomplete="email"
            class="input-field"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-wrapper">
          <Lock size={20} class="input-icon" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="••••••••"
            required
            autocomplete="new-password"
            minlength="8"
            class="input-field"
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            class="toggle-password"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <EyeOff size={20} />
            {:else}
              <Eye size={20} />
            {/if}
          </button>
        </div>
        <p class="helper-text">Must be at least 8 characters</p>
      </div>
      
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={acceptTerms}
            required
            class="checkbox"
          />
          <span>
            I agree to the <a href="/terms" class="link">Terms of Service</a> and 
            <a href="/privacy" class="link">Privacy Policy</a>
          </span>
        </label>
      </div>
      
      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
    
    <!-- Benefits -->
    <div class="benefits">
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Join 50,000+ sellers</span>
      </div>
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Secure payments</span>
      </div>
      <div class="benefit">
        <span class="benefit-icon">✓</span>
        <span>Buyer protection</span>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="auth-footer">
      Already have an account? 
      <a href="/auth/login" class="link">Sign in</a>
    </div>
  </div>
</div>

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--color-gray-50);
  }
  
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-background);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  
  .logo {
    display: block;
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, var(--color-primary), #6c63ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-decoration: none;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .auth-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.5rem;
  }
  
  .auth-header p {
    color: var(--color-text-secondary);
  }
  
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .account-type-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .account-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    gap: 0.75rem;
  }

  .account-card:hover {
    border-color: var(--color-primary);
    background: var(--color-primary-light, #f0f7ff);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.15);
  }

  .account-card.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light, #f0f7ff);
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
  }

  .account-card .account-icon {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .account-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 0.25rem 0;
  }

  .account-info p {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.3;
  }

  .brand-field {
    animation: slideIn 0.3s ease-out;
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
    display: flex;
    align-items: center;
  }
  
  .input-wrapper .input-icon {
    position: absolute;
    left: 1rem;
    color: var(--color-text-muted);
    pointer-events: none;
  }
  
  .input-field {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 1rem;
    color: var(--color-text-primary);
    transition: all 0.2s;
  }
  
  .input-field:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1);
  }
  
  .toggle-password {
    position: absolute;
    right: 1rem;
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .toggle-password:hover {
    color: var(--color-text-secondary);
  }
  
  .helper-text {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  
  .checkbox-group {
    gap: 0.75rem;
  }
  
  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  
  .checkbox {
    margin-top: 0.125rem;
    cursor: pointer;
  }
  
  .link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  
  .link:hover {
    opacity: 0.8;
  }
  
  .submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .submit-btn:hover:not(:disabled) {
    background: #1567d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.2);
  }
  
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .benefits {
    display: flex;
    justify-content: space-around;
    margin: 1.5rem 0;
    padding: 1.5rem 0;
    border-top: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }
  
  .benefit {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  
  .benefit-icon {
    color: var(--color-success);
    font-weight: 700;
  }
  
  .auth-footer {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  @media (max-width: 640px) {
    .auth-card {
      padding: 1.5rem;
    }
    
    .benefits {
      flex-direction: column;
      gap: 0.75rem;
      align-items: center;
    }

    .account-type-cards {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .account-card {
      flex-direction: row;
      text-align: left;
      padding: 1rem;
      gap: 1rem;
    }

    .account-info {
      flex: 1;
    }

    .account-card .account-icon {
      margin-bottom: 0;
      flex-shrink: 0;
    }
  }
</style>