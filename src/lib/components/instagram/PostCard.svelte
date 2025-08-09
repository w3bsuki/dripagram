<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import UserBadge from './UserBadge.svelte';
	import ActionBar from './ActionBar.svelte';
	
	interface Props {
		id: string;
		title: string;
		price: number;
		currency?: string;
		image: string;
		images?: string[];
		seller: {
			id: string;
			avatar: string;
			username: string;
			verified?: boolean;
			rating?: number;
		};
		liked?: boolean;
		saved?: boolean;
		likeCount?: number;
		commentCount?: number;
		caption?: string;
		condition?: string;
		size?: string;
		brand?: string;
		class?: string;
	}
	
	let {
		id,
		title,
		price,
		currency = 'лв',
		image,
		images = [],
		seller,
		liked = false,
		saved = false,
		likeCount = 0,
		commentCount = 0,
		caption,
		condition,
		size,
		brand,
		class: className = ''
	}: Props = $props();
	
	let showHeart = $state(false);
	let heartAnimating = $state(false);
	let localLiked = $state(liked);
	let imageLoaded = $state(false);
	
	const allImages = images.length > 0 ? images : [image];
	let currentImageIndex = $state(0);
	
	function handleDoubleClick() {
		if (!localLiked) {
			localLiked = true;
			showHeart = true;
			heartAnimating = true;
			
			setTimeout(() => {
				showHeart = false;
				heartAnimating = false;
			}, 1000);
		}
	}
	
	function handleLike(event: CustomEvent) {
		localLiked = event.detail.liked;
	}
	
	function handleSellerClick() {
		// Navigate to seller profile
		window.location.href = `/user/${seller.username}`;
	}
	
	function handleImageLoad() {
		imageLoaded = true;
	}
	
	onMount(() => {
		// Preload next image if carousel
		if (allImages.length > 1) {
			const nextImage = new Image();
			nextImage.src = allImages[1];
		}
	});
</script>

<article class="post-card {className}">
	<!-- Header -->
	<header class="post-header">
		<UserBadge
			avatar={seller.avatar}
			username={seller.username}
			subtitle="2 hours ago"
			verified={seller.verified}
			rating={seller.rating}
			hasStory={true}
			size="sm"
			onclick={handleSellerClick}
		/>
	</header>
	
	<!-- Image -->
	<button class="post-image" ondblclick={handleDoubleClick} aria-label="Double-tap to like">
		{#if !imageLoaded}
			<div class="image-skeleton"></div>
		{/if}
		<img 
			src={allImages[currentImageIndex]} 
			alt={title}
			loading="lazy"
			onload={handleImageLoad}
			class:loaded={imageLoaded}
		/>
		
		<!-- Double tap heart animation -->
		{#if showHeart}
			<div class="heart-animation {heartAnimating ? 'animating' : ''}">
				<Heart size={80} fill="white" stroke="white" />
			</div>
		{/if}
		
		<!-- Product info overlay -->
		<div class="product-info-overlay">
			<span class="price">{price} {currency}</span>
			{#if condition === 'new-tags'}
				<span class="badge new">NEW</span>
			{/if}
		</div>
	</div>
	
	<!-- Actions -->
	<div class="post-actions">
		<ActionBar
			liked={localLiked}
			saved={saved}
			likeCount={likeCount}
			commentCount={commentCount}
			on:like={handleLike}
		/>
	</div>
	
	<!-- Content -->
	<div class="post-content">
		<h3 class="product-title">{title}</h3>
		{#if caption}
			<p class="caption">{caption}</p>
		{/if}
		
		<div class="product-meta">
			{#if brand}
				<span class="meta-item">#{brand}</span>
			{/if}
			{#if size}
				<span class="meta-item">Size {size}</span>
			{/if}
			{#if condition}
				<span class="meta-item">{condition}</span>
			{/if}
		</div>
	</div>
</article>

<style>
	.post-card {
		background: var(--color-white);
		border-radius: 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-gray-300);
	}
	
	@media (min-width: 640px) {
		.post-card {
			border-radius: 8px;
			border: 1px solid var(--color-gray-300);
			margin-bottom: 1.5rem;
		}
	}
	
	.post-header {
		padding: 0.75rem 1rem;
	}
	
	.post-image {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		background: var(--color-gray-100);
		overflow: hidden;
		cursor: pointer;
		user-select: none;
		border: none;
		padding: 0;
		display: block;
	}
	
	.post-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.post-image img.loaded {
		opacity: 1;
	}
	
	.image-skeleton {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			var(--color-gray-100) 0%,
			var(--color-gray-200) 50%,
			var(--color-gray-100) 100%
		);
		animation: shimmer 2s infinite;
	}
	
	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
	
	.heart-animation {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		pointer-events: none;
		z-index: var(--z-low);
		opacity: 0;
	}
	
	.heart-animation.animating {
		animation: heartPop 1s ease;
	}
	
	@keyframes heartPop {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0);
		}
		15% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.2);
		}
		30% {
			transform: translate(-50%, -50%) scale(0.95);
		}
		45% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		80%, 100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8);
		}
	}
	
	.product-info-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		pointer-events: none;
	}
	
	.price {
		color: white;
		font-size: 1.125rem;
		font-weight: 700;
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
	}
	
	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.badge.new {
		background: var(--color-success);
		color: white;
	}
	
	.post-actions {
		padding: 0 1rem;
	}
	
	.post-content {
		padding: 0 1rem 1rem;
	}
	
	.product-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-gray-900);
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
	
	.caption {
		font-size: 0.875rem;
		color: var(--color-gray-900);
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}
	
	.product-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	
	.meta-item {
		font-size: 0.75rem;
		color: var(--color-brand);
		font-weight: 500;
	}
</style>