<script lang="ts">
    let { listings, buildLocalizedUrl } = $props();
</script>

<div class="posts-grid">
    {#each listings as listing}
        <a href={buildLocalizedUrl(`/products/${listing.id}`)} class="post-item">
            <img 
                src={listing.thumbnail_url || '/placeholder.jpg'} 
                alt={listing.title}
                class="post-image"
                loading="lazy"
            />
            <div class="post-overlay">
                <span class="post-price">€{listing.price}</span>
            </div>
        </a>
    {/each}
</div>

<style>
    .posts-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 3px;
    }

    .post-item {
        aspect-ratio: 1;
        position: relative;
        overflow: hidden;
        background: #f5f5f5;
        display: block;
    }

    .post-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: filter 0.2s;
    }

    .post-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .post-item:hover .post-overlay {
        opacity: 1;
    }

    .post-price {
        color: white;
        font-size: 16px;
        font-weight: 600;
    }
</style>
