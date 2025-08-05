<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, CheckCircle, ExternalLink } from '@lucide/svelte';
  import { auth } from '$lib/stores/auth';
  import { supabase } from '$lib/supabase';
  import { goto } from '$app/navigation';
  
  interface Brand {
    id: string;
    username: string;
    brand_name: string;
    brand_logo_url: string;
    brand_category: string;
    follower_count: number;
    listing_count: number;
    isFollowing?: boolean;
  }
  
  let brands = $state<Brand[]>([]);
  let selectedBrand = $state<Brand | null>(null);
  let loading = $state(true);
  
  onMount(async () => {
    await loadBrands();
  });
  
  async function loadBrands() {
    try {
      const { data, error } = await supabase
        .rpc('get_verified_brands', { limit_count: 10 });
      
      if (error) throw error;
      
      // Add demo data if no real brands exist
      if (!data || data.length === 0) {
        brands = getDemoBrands();
      } else {
        brands = data;
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      brands = getDemoBrands();
    } finally {
      loading = false;
    }
  }
  
  function getDemoBrands(): Brand[] {
    return [
      {
        id: '1',
        username: 'nike_bulgaria',
        brand_name: 'Nike Bulgaria',
        brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png',
        brand_category: 'Sportswear',
        follower_count: 15234,
        listing_count: 89
      },
      {
        id: '2',
        username: 'zara_bg',
        brand_name: 'Zara',
        brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/05/Zara-Logo.png',
        brand_category: 'Fashion',
        follower_count: 12890,
        listing_count: 156
      },
      {
        id: '3',
        username: 'hm_bulgaria',
        brand_name: 'H&M',
        brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/HM-Logo.png',
        brand_category: 'Fashion',
        follower_count: 9876,
        listing_count: 234
      },
      {
        id: '4',
        username: 'adidas_bg',
        brand_name: 'Adidas Bulgaria',
        brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png',
        brand_category: 'Sportswear',
        follower_count: 8765,
        listing_count: 67
      },
      {
        id: '5',
        username: 'reserved_bg',
        brand_name: 'Reserved',
        brand_logo_url: 'https://i.pinimg.com/originals/5e/4e/0d/5e4e0d6f4c8c6a6b8e6c8e6c8e6c8e6c.jpg',
        brand_category: 'Fashion',
        follower_count: 6543,
        listing_count: 123
      },
      {
        id: '6',
        username: 'mango_bulgaria',
        brand_name: 'Mango',
        brand_logo_url: 'https://logos-world.net/wp-content/uploads/2020/12/Mango-Logo.png',
        brand_category: 'Fashion',
        follower_count: 5432,
        listing_count: 98
      }
    ];
  }
  
  function openBrand(brand: Brand) {
    selectedBrand = brand;
  }
  
  function closeBrandModal() {
    selectedBrand = null;
  }
  
  function navigateToBrand(brand: Brand) {
    goto(`/@${brand.username}`);
  }
  
  function formatFollowers(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
</script>

<div class="brand-showcase">
  <div class="showcase-header">
    <h3>Verified Brands</h3>
    {#if $auth.user?.account_type === 'brand' && !$auth.user?.brand_verified}
      <button class="verify-btn" onclick={() => goto('/account/verify')}>
        Get Verified
      </button>
    {/if}
  </div>
  
  <div class="brand-container">
    <!-- Your Brand (if applicable) -->
    {#if $auth.user?.account_type === 'brand'}
      <button class="brand-item your-brand" onclick={() => goto('/dashboard')}>
        <div class="brand-avatar">
          <img 
            src={$auth.user?.brand_logo_url || 'https://ui-avatars.com/api/?name=Your+Brand&background=1877f2&color=fff'} 
            alt="Your brand"
          />
          {#if !$auth.user?.brand_verified}
            <span class="add-icon">
              <Plus size={16} />
            </span>
          {/if}
        </div>
        <span class="brand-label">Your Brand</span>
      </button>
    {/if}
    
    <!-- Verified Brands -->
    {#if loading}
      <!-- Loading skeletons -->
      {#each Array(5) as _, i}
        <div class="brand-item skeleton">
          <div class="brand-avatar skeleton-avatar"></div>
          <span class="brand-label skeleton-text"></span>
        </div>
      {/each}
    {:else}
      {#each brands as brand (brand.id)}
        <button 
          class="brand-item"
          onclick={() => openBrand(brand)}
        >
          <div class="brand-avatar verified">
            <img src={brand.brand_logo_url} alt={brand.brand_name} />
            <span class="verified-badge">
              <CheckCircle size={14} fill="currentColor" />
            </span>
          </div>
          <span class="brand-label">{brand.brand_name}</span>
        </button>
      {/each}
    {/if}
  </div>
</div>

<!-- Brand Modal -->
{#if selectedBrand}
  <div class="brand-modal" onclick={closeBrandModal}>
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <!-- Header -->
      <div class="modal-header">
        <img 
          src={selectedBrand.brand_logo_url} 
          alt={selectedBrand.brand_name}
          class="brand-logo"
        />
        <div class="brand-info">
          <h2>{selectedBrand.brand_name}</h2>
          <p>@{selectedBrand.username}</p>
        </div>
        <button class="close-btn" onclick={closeBrandModal}>×</button>
      </div>
      
      <!-- Stats -->
      <div class="brand-stats">
        <div class="stat">
          <span class="stat-value">{selectedBrand.listing_count}</span>
          <span class="stat-label">Products</span>
        </div>
        <div class="stat">
          <span class="stat-value">{formatFollowers(selectedBrand.follower_count)}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">{selectedBrand.brand_category}</span>
          <span class="stat-label">Category</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="modal-actions">
        <button 
          class="action-btn primary"
          onclick={() => navigateToBrand(selectedBrand)}
        >
          <ExternalLink size={18} />
          View Shop
        </button>
        <button class="action-btn secondary">
          {selectedBrand.isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .brand-showcase {
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    padding: 0.75rem 0;
  }
  
  .showcase-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
    margin-bottom: 0.75rem;
  }
  
  .showcase-header h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .verify-btn {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 999px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .verify-btn:hover {
    background: #1567d8;
    transform: scale(1.05);
  }
  
  .brand-container {
    display: flex;
    gap: 1rem;
    padding: 0 1rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .brand-container::-webkit-scrollbar {
    display: none;
  }
  
  .brand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    position: relative;
  }
  
  .brand-avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, var(--color-primary), #6c63ff, #ff6b6b);
    background-size: 200% 200%;
    position: relative;
    transition: transform 0.2s;
    overflow: hidden;
    animation: gradient-shift 3s ease infinite;
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  .brand-item:hover .brand-avatar {
    transform: scale(1.05);
  }
  
  .brand-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
    background: white;
    border: 3px solid var(--color-background);
    padding: 8px;
  }
  
  .verified-badge {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: var(--color-primary);
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .your-brand .add-icon {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: var(--color-primary);
    color: white;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-background);
  }
  
  .brand-label {
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    max-width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    text-align: center;
  }
  
  /* Loading Skeletons */
  .skeleton-avatar {
    background: var(--color-gray-200);
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-text {
    width: 50px;
    height: 10px;
    background: var(--color-gray-200);
    border-radius: 4px;
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  /* Brand Modal */
  .brand-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s;
    padding: 1rem;
  }
  
  .modal-content {
    width: 100%;
    max-width: 400px;
    background: var(--color-background);
    border-radius: 16px;
    overflow: hidden;
    animation: slideUp 0.3s;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
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
  
  .modal-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  .brand-logo {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: contain;
    background: white;
    padding: 8px;
    border: 1px solid var(--color-border);
  }
  
  .brand-info {
    flex: 1;
  }
  
  .brand-info h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }
  
  .brand-info p {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  
  .close-btn {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: 2rem;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
  }
  
  .close-btn:hover {
    background: var(--color-gray-100);
  }
  
  .brand-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 1.5rem;
    gap: 1rem;
    border-bottom: 1px solid var(--color-border);
  }
  
  .stat {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .action-btn {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .action-btn.primary {
    background: var(--color-primary);
    color: white;
  }
  
  .action-btn.primary:hover {
    background: #1567d8;
    transform: translateY(-1px);
  }
  
  .action-btn.secondary {
    background: var(--color-gray-100);
    color: var(--color-text-primary);
  }
  
  .action-btn.secondary:hover {
    background: var(--color-gray-200);
  }
</style>