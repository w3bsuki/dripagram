<script lang="ts">
  import { Heart, ShoppingBag, Eye, Search } from '@lucide/svelte';
  
  interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    seller: {
      username: string;
      avatar: string;
      verified?: boolean;
    };
    likes: number;
    isLiked?: boolean;
    size?: string;
    brand?: string;
    condition?: string;
  }
  
  let products = $state<Product[]>([
    {
      id: '1',
      title: 'Vintage Denim Jacket',
      price: 89,
      image: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=400&h=500&fit=crop',
      seller: {
        username: 'vintage_finds',
        avatar: 'https://i.pravatar.cc/150?img=1',
        verified: true
      },
      likes: 234,
      brand: 'Levi\'s',
      size: 'M',
      condition: 'Excellent'
    },
    {
      id: '2',
      title: 'Designer Silk Dress',
      price: 156,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
      seller: {
        username: 'luxury_closet',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      likes: 412,
      isLiked: true,
      brand: 'Zara',
      size: 'S',
      condition: 'Like New'
    },
    {
      id: '3',
      title: 'Streetwear Hoodie',
      price: 75,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop',
      seller: {
        username: 'street_style',
        avatar: 'https://i.pravatar.cc/150?img=3',
        verified: true
      },
      likes: 189,
      brand: 'Supreme',
      size: 'L',
      condition: 'New with Tags'
    },
    {
      id: '4',
      title: 'Leather Ankle Boots',
      price: 120,
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop',
      seller: {
        username: 'shoe_haven',
        avatar: 'https://i.pravatar.cc/150?img=4'
      },
      likes: 298,
      brand: 'Dr. Martens',
      size: '38',
      condition: 'Good'
    },
    {
      id: '5',
      title: 'Retro Sunglasses',
      price: 45,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop',
      seller: {
        username: 'accessories_bg',
        avatar: 'https://i.pravatar.cc/150?img=5'
      },
      likes: 156,
      brand: 'Ray-Ban',
      condition: 'Excellent'
    },
    {
      id: '6',
      title: 'Knit Sweater',
      price: 68,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop',
      seller: {
        username: 'cozy_style',
        avatar: 'https://i.pravatar.cc/150?img=6',
        verified: true
      },
      likes: 342,
      isLiked: true,
      brand: 'COS',
      size: 'M',
      condition: 'Like New'
    },
    {
      id: '7',
      title: 'Canvas Backpack',
      price: 52,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
      seller: {
        username: 'urban_gear',
        avatar: 'https://i.pravatar.cc/150?img=7'
      },
      likes: 128,
      brand: 'Herschel',
      condition: 'Good'
    },
    {
      id: '8',
      title: 'Floral Summer Dress',
      price: 78,
      image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=500&fit=crop',
      seller: {
        username: 'summer_vibes',
        avatar: 'https://i.pravatar.cc/150?img=8'
      },
      likes: 267,
      brand: 'H&M',
      size: 'M',
      condition: 'Excellent'
    }
  ]);
  
  let searchQuery = $state('');
  let showCategories = $state(false);
  let selectedCategory = $state<string | null>(null);
  let filterBy = $state<string | null>(null);
  
  function toggleLike(product: Product) {
    product.isLiked = !product.isLiked;
    product.likes += product.isLiked ? 1 : -1;
  }
</script>

<div class="product-grid-container">
  <!-- Enhanced Controls with Categories and Search -->
  <div class="search-controls">
    <div class="controls-container">
      <!-- Category Button -->
      <button 
        class="category-btn"
        onclick={() => showCategories = !showCategories}
        aria-label="Browse categories"
      >
        <span class="category-icon">🛍️</span>
        <span>Categories</span>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" class:rotate={showCategories}>
          <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      
      <div class="divider"></div>
      
      <!-- Search Input -->
      <div class="search-section">
        <Search size={16} class="search-icon" />
        <input
          type="search"
          bind:value={searchQuery}
          placeholder="Search products..."
          class="search-input"
        />
      </div>
    </div>
  </div>
  
  <!-- Category Dropdown Menu -->
  {#if showCategories}
    <div class="category-dropdown">
      <div class="dropdown-section">
        <h4 class="dropdown-label">Categories</h4>
        <div class="category-scroll">
          <button class="category-item" onclick={() => { selectedCategory = 'women'; showCategories = false; }}>
            <span class="cat-emoji">👗</span>
            <span>Women</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'men'; showCategories = false; }}>
            <span class="cat-emoji">👔</span>
            <span>Men</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'shoes'; showCategories = false; }}>
            <span class="cat-emoji">👟</span>
            <span>Shoes</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'bags'; showCategories = false; }}>
            <span class="cat-emoji">👜</span>
            <span>Bags</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'accessories'; showCategories = false; }}>
            <span class="cat-emoji">💍</span>
            <span>Accessories</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'kids'; showCategories = false; }}>
            <span class="cat-emoji">👶</span>
            <span>Kids</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'vintage'; showCategories = false; }}>
            <span class="cat-emoji">📿</span>
            <span>Vintage</span>
          </button>
          <button class="category-item" onclick={() => { selectedCategory = 'luxury'; showCategories = false; }}>
            <span class="cat-emoji">💎</span>
            <span>Luxury</span>
          </button>
        </div>
      </div>
      <div class="dropdown-section">
        <h4 class="dropdown-label">Quick Filters</h4>
        <div class="filter-scroll">
          <button class="filter-chip" onclick={() => { filterBy = 'new'; showCategories = false; }}>
            🏷️ New with tags
          </button>
          <button class="filter-chip" onclick={() => { filterBy = 'under50'; showCategories = false; }}>
            💰 Under 50лв
          </button>
          <button class="filter-chip" onclick={() => { filterBy = 'trending'; showCategories = false; }}>
            🔥 Trending
          </button>
          <button class="filter-chip" onclick={() => { filterBy = 'sale'; showCategories = false; }}>
            🎯 On Sale
          </button>
          <button class="filter-chip" onclick={() => { filterBy = 'verified'; showCategories = false; }}>
            ✅ Verified Only
          </button>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Product Grid -->
  <div class="product-grid">
    {#each products as product (product.id)}
      <article class="product-card">
        <div class="product-image-wrapper">
          <img 
            src={product.image} 
            alt={product.title}
            class="product-image"
            loading="lazy"
          />
          
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button 
              class="action-btn like-btn {product.isLiked ? 'liked' : ''}"
              onclick={() => toggleLike(product)}
              aria-label={product.isLiked ? 'Unlike' : 'Like'}
            >
              <Heart size={18} fill={product.isLiked ? 'currentColor' : 'none'} />
            </button>
            <button class="action-btn" aria-label="Quick view">
              <Eye size={18} />
            </button>
            <button class="action-btn" aria-label="Add to bag">
              <ShoppingBag size={18} />
            </button>
          </div>
          
          <!-- Seller Badge -->
          <div class="seller-badge">
            <img src={product.seller.avatar} alt={product.seller.username} />
            {#if product.seller.verified}
              <span class="verified">✓</span>
            {/if}
          </div>
        </div>
        
        <div class="product-info">
          <div class="product-header">
            <h3 class="product-title">{product.title}</h3>
            <span class="product-price">{product.price} лв</span>
          </div>
          
          <div class="product-meta">
            {#if product.brand}
              <span class="meta-tag">{product.brand}</span>
            {/if}
            {#if product.size}
              <span class="meta-tag">Size {product.size}</span>
            {/if}
            {#if product.condition}
              <span class="meta-tag condition">{product.condition}</span>
            {/if}
          </div>
          
          <div class="product-footer">
            <span class="seller-name">@{product.seller.username}</span>
            <span class="likes-count">
              <Heart size={14} />
              {product.likes}
            </span>
          </div>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .product-grid-container {
    padding: 1rem;
  }
  
  .search-controls {
    margin-bottom: 1rem;
  }
  
  .controls-container {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
  
  .category-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    background: none;
    border: none;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .category-btn:hover {
    background: var(--color-gray-50);
  }
  
  .category-btn:active {
    background: var(--color-gray-100);
  }
  
  .category-btn svg {
    transition: transform 0.2s;
    opacity: 0.6;
  }
  
  .category-btn svg.rotate {
    transform: rotate(180deg);
  }
  
  .category-icon {
    font-size: 1.125rem;
  }
  
  .divider {
    width: 1px;
    height: 24px;
    background: var(--color-border);
  }
  
  .search-section {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .search-section :global(.search-icon) {
    position: absolute;
    left: 16px;
    color: #8e8e8e;
    pointer-events: none;
  }
  
  .search-input {
    width: 100%;
    background: none;
    border: none;
    padding: 0.875rem 16px 0.875rem 44px;
    font-size: 0.875rem;
    color: var(--color-text-primary);
    outline: none;
  }
  
  .search-input::placeholder {
    color: #8e8e8e;
  }
  
  
  /* Category Dropdown */
  .category-dropdown {
    background: white;
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem 0;
    margin-bottom: 1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    animation: slideDown 0.2s ease;
    overflow: hidden;
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
  
  .dropdown-section {
    margin-bottom: 1rem;
  }
  
  .dropdown-section:last-child {
    margin-bottom: 0;
  }
  
  .dropdown-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 1rem 0.5rem;
  }
  
  .category-scroll {
    display: flex;
    gap: 0.5rem;
    padding: 0 1rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .category-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem;
    background: #f8f8f8;
    border: 1px solid transparent;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    min-width: 80px;
  }
  
  .category-item:hover {
    background: white;
    border-color: var(--color-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .category-item:active {
    transform: translateY(0);
  }
  
  .cat-emoji {
    font-size: 1.5rem;
  }
  
  .filter-scroll {
    display: flex;
    gap: 0.5rem;
    padding: 0 1rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .filter-scroll::-webkit-scrollbar {
    display: none;
  }
  
  .filter-chip {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-text-primary);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .filter-chip:hover {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }
  
  .filter-chip:active {
    transform: translateY(0);
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }
  }
  
  
  .product-card {
    background: var(--color-background);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    cursor: pointer;
  }
  
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  
  .product-image-wrapper {
    position: relative;
    aspect-ratio: 4/5;
    overflow: hidden;
    background: var(--color-gray-100);
  }
  
  
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .product-card:hover .product-image {
    transform: scale(1.05);
  }
  
  .quick-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s;
  }
  
  .product-card:hover .quick-actions {
    opacity: 1;
    transform: translateX(0);
  }
  
  .action-btn {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-text-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .action-btn:hover {
    transform: scale(1.1);
    background: white;
  }
  
  .action-btn.like-btn.liked {
    color: #ff4458;
  }
  
  .seller-badge {
    position: absolute;
    bottom: 0.5rem;
    left: 0.5rem;
    display: flex;
    align-items: center;
  }
  
  .seller-badge img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .seller-badge .verified {
    position: absolute;
    bottom: -2px;
    right: -2px;
    background: var(--color-success);
    color: white;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    border: 2px solid white;
  }
  
  .product-info {
    padding: 0.75rem;
  }
  
  
  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .product-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-primary);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  
  .product-price {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-primary);
    white-space: nowrap;
  }
  
  .product-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  .meta-tag {
    font-size: 0.625rem;
    padding: 2px 6px;
    background: var(--color-gray-100);
    color: var(--color-text-secondary);
    border-radius: 4px;
    white-space: nowrap;
  }
  
  .meta-tag.condition {
    background: var(--color-success-light);
    color: var(--color-success);
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  
  .seller-name {
    font-weight: 500;
  }
  
  .likes-count {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .likes-count :global(svg) {
    color: var(--color-text-muted);
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    .product-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }
    
    .product-info {
      padding: 0.5rem;
    }
    
    .product-title {
      font-size: 0.75rem;
    }
    
    .product-price {
      font-size: 0.875rem;
    }
    
    .meta-tag {
      font-size: 0.5625rem;
    }
    
    .quick-actions {
      opacity: 1;
      transform: translateX(0);
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
    }
  }
  
  /* Mobile responsiveness for new controls */
  @media (max-width: 640px) {
    .controls-container {
      font-size: 0.875rem;
    }
    
    .category-btn {
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
    }
    
    .category-btn span:not(.category-icon) {
      display: none;
    }
    
    .search-input {
      font-size: 0.8rem;
      padding: 0.75rem 12px 0.75rem 36px;
    }
    
    .search-section :global(.search-icon) {
      left: 12px;
    }
    
    .category-item {
      min-width: 70px;
      padding: 0.5rem;
      font-size: 0.75rem;
    }
    
    .cat-emoji {
      font-size: 1.25rem;
    }
  }
</style>