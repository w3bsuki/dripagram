<script lang="ts">
	import { Grid3x3, Package, Heart } from '@lucide/svelte';

    let { activeTab, onTabChange } = $props();

</script>

<div class="tab-nav">
    <div class="tab-container">
        <button 
            class="tab-button {activeTab === 'listings' ? 'active' : ''}"
            onclick={() => onTabChange('listings')}
        >
            <Grid3x3 size={12} />
            <span>POSTS</span>
        </button>
        <button 
            class="tab-button {activeTab === 'sold' ? 'active' : ''}"
            onclick={() => onTabChange('sold')}
        >
            <Package size={12} />
            <span>SOLD</span>
        </button>
        <button 
            class="tab-button {activeTab === 'liked' ? 'active' : ''}"
            onclick={() => onTabChange('liked')}
        >
            <Heart size={12} />
            <span>SAVED</span>
        </button>
    </div>
</div>

<style>
    .tab-nav {
        background: white;
        border-bottom: 1px solid #dbdbdb;
    }

    .tab-container {
        max-width: 935px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
    }

    .tab-button {
        background: none;
        border: none;
        border-top: 1px solid transparent;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #8e8e8e;
        text-transform: uppercase;
        transition: color 0.2s, border-color 0.2s;
    }

    .tab-button.active {
        color: #262626;
        border-top-color: #262626;
    }

    .tab-button:hover:not(.active) {
        color: #262626;
    }
</style>
