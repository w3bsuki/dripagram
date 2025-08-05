<script lang="ts">
  import { Search, Camera, ShoppingBag } from '@lucide/svelte';
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  let searchQuery = $state('');
  let showSearch = $state(false);
  let cartCount = $state(3); // TODO: Get from cart store
  
  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      goto(`/search?q=${encodeURIComponent(searchQuery)}`);
      showSearch = false;
    }
  }
  
  function openVisualSearch() {
    // TODO: Implement visual search
    console.log('Opening visual search...');
  }
</script>

<header class="search-header">
  <div class="header-content">
    <!-- Logo -->
    <a href="/" class="logo">driplo</a>
    
    <div class="header-actions">
      <!-- Cart -->
      <a href="/cart" class="cart-icon" aria-label="Shopping cart">
        <ShoppingBag size={24} />
        {#if cartCount > 0}
          <span class="cart-badge">{cartCount}</span>
        {/if}
      </a>
      
      <!-- Search Button -->
      <button 
        class="search-trigger"
        onclick={() => showSearch = !showSearch}
        aria-label="Search"
      >
        <Search size={24} />
      </button>
    </div>
  </div>
  
  <!-- Expandable Search Bar -->
  {#if showSearch}
    <form class="search-form" onsubmit={handleSearch}>
      <div class="search-input-wrapper">
        <Search size={20} class="search-icon" />
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search for items, brands, or sellers..."
          class="search-input"
          autofocus
        />
        <button
          type="button"
          class="visual-search-btn"
          onclick={openVisualSearch}
          aria-label="Visual search"
        >
          <Camera size={20} />
        </button>
      </div>
    </form>
  {/if}
</header>

<style>
  .search-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: white;
    border-bottom: 1px solid rgb(219, 219, 219);
    z-index: 100;
    transition: all 0.3s;
  }
  
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    height: 56px;
  }
  
  .logo {
    font-size: 1.75rem;
    font-weight: 800;
    color: #262626;
    text-decoration: none;
    letter-spacing: -1px;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .search-trigger,
  .cart-icon {
    background: none;
    border: none;
    color: var(--color-text-primary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.2s;
    border-radius: 12px;
  }
  
  .search-trigger:hover,
  .cart-icon:hover {
    background: var(--color-gray-50);
  }
  
  .cart-icon {
    text-decoration: none;
  }
  
  .search-trigger:active,
  .cart-icon:active {
    transform: scale(0.95);
  }
  
  .cart-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    background: #ff3040;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 999px;
    min-width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .search-form {
    padding: 0 1rem 1rem;
    animation: slideDown 0.2s ease;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    padding: 0 1rem;
    transition: all 0.2s;
  }
  
  .search-input-wrapper:focus-within {
    border-color: var(--color-primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(24, 119, 242, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  .search-icon {
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  
  .search-input {
    flex: 1;
    background: none;
    border: none;
    padding: 0.75rem;
    font-size: 1rem;
    color: var(--color-text-primary);
    outline: none;
  }
  
  .search-input::placeholder {
    color: var(--color-text-muted);
  }
  
  .visual-search-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .visual-search-btn:hover {
    color: var(--color-primary);
    background: var(--color-gray-50);
    border-radius: 50%;
  }
</style>