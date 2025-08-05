<script lang="ts">
  import { Home, Search, PlusCircle, ShoppingBag, User } from '@lucide/svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  
  const navItems = [
    { icon: Home, label: 'Feed', href: '/' },
    { icon: Search, label: 'Browse', href: '/browse' },
    { icon: PlusCircle, label: 'Sell', href: '/sell', accent: true },
    { icon: ShoppingBag, label: 'Cart', href: '/cart' },
    { icon: User, label: 'Profile', href: $auth.user ? `/profile/${$auth.user.username}` : '/auth/login' }
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<nav class="bottom-nav">
  {#each navItems as item}
    <a 
      href={item.href}
      class="nav-item {item.accent ? 'accent' : ''} {currentPath === item.href ? 'active' : ''}"
      aria-label={item.label}
    >
      <svelte:component this={item.icon} size={24} />
      <span class="nav-label">{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 60px;
    z-index: 100;
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    text-decoration: none;
    color: var(--color-text-secondary);
    transition: all 0.2s;
    padding: 0.5rem 0;
    position: relative;
  }
  
  .nav-item.active {
    color: var(--color-primary);
  }
  
  .nav-item.accent {
    color: var(--color-accent);
  }
  
  .nav-item:active {
    transform: scale(0.95);
  }
  
  .nav-label {
    font-size: 0.625rem;
    font-weight: 500;
  }
  
  /* Add indicator dot for active state */
  .nav-item.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: var(--color-primary);
    border-radius: 50%;
  }
  
  /* Larger touch target for accessibility */
  @media (hover: none) {
    .nav-item {
      min-height: 48px;
      min-width: 48px;
    }
  }
</style>