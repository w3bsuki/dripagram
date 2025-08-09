<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';

	type User = {
		id: string;
		title: string;
		subtitle: string;
		imageUrl: string;
		isVerified: boolean;
		followerCount: number;
		productCount: number;
	};

	let { 
		user,
		isVisible,
		onClose
	}: {
		user: User | null;
		isVisible: boolean;
		onClose: () => void;
	} = $props();

	let modalElement = $state<HTMLDivElement>();
	let previouslyFocusedElement: HTMLElement | null = null;

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
	
	function handleModalClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
	}

	function visitUserProfile() {
		if (user) {
			onClose();
			goto(`/user/${user.id}`);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
		
		// Focus trapping
		if (event.key === 'Tab') {
			const focusableElements = modalElement?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (!focusableElements?.length) return;
			
			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
			
			if (event.shiftKey) {
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	}

	async function setupFocus() {
		if (isVisible && modalElement) {
			// Store the previously focused element
			previouslyFocusedElement = document.activeElement as HTMLElement;
			
			// Wait for next tick to ensure modal is rendered
			await tick();
			
			// Focus the first focusable element
			const focusableElements = modalElement.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			if (focusableElements.length > 0) {
				(focusableElements[0] as HTMLElement).focus();
			}
		} else if (!isVisible && previouslyFocusedElement) {
			// Return focus to the previously focused element
			previouslyFocusedElement.focus();
			previouslyFocusedElement = null;
		}
	}

	$effect(() => {
		setupFocus();
		
		if (isVisible) {
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('keydown', handleKeydown);
		}

		// Cleanup
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<!-- User Quick View Modal -->
{#if isVisible && user}
	<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="user-modal-title" bind:this={modalElement}>
		<button class="modal-backdrop" onclick={handleOverlayClick} aria-label="Close modal"></button>
		<div 
			class="brand-modal" 
			onclick={handleModalClick}
			onkeydown={handleModalClick}
			role="document"
			tabindex="-1"
		>
			<button class="modal-close" onclick={onClose} aria-label="Close modal">✕</button>
			
			<div class="brand-modal-header">
				<img 
					src={user.imageUrl} 
					alt={user.title}
					class="brand-modal-image"
				/>
				<div class="brand-modal-info">
					<div class="brand-modal-title" id="user-modal-title">
						{user.title}
						{#if user.isVerified}
							<svg class="verified-icon" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified user">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</div>
					<div class="brand-modal-subtitle">{user.subtitle}</div>
					<div class="brand-stats">
						<div class="stat">
							<strong>{user.followerCount.toLocaleString()}</strong>
							<span>Followers</span>
						</div>
						<div class="stat">
							<strong>{user.productCount}</strong>
							<span>Products</span>
						</div>
					</div>
				</div>
			</div>
			
			<div class="brand-modal-actions">
				<button class="follow-btn" aria-label="Follow {user.title}">Follow</button>
				<button class="visit-store-btn" onclick={visitUserProfile} aria-label="Visit {user.title}'s profile">
					Visit Profile
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Brand Quick View Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-higher);
		padding: 1rem;
	}

	.modal-backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		cursor: pointer;
		z-index: 0;
	}
	
	.brand-modal {
		background: white;
		border-radius: 12px;
		max-width: 400px;
		width: 100%;
		padding: 1.5rem;
		position: relative;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
		z-index: 1;
	}
	
	.modal-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		font-size: 1.5rem;
		color: var(--color-text-muted);
		cursor: pointer;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background 0.2s;
	}
	
	.modal-close:hover {
		background: var(--color-border-lighter);
	}
	
	.brand-modal-header {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	
	.brand-modal-image {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--color-border-light);
	}
	
	.brand-modal-info {
		flex: 1;
	}
	
	.brand-modal-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-dark);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	
	.verified-icon {
		background: var(--color-surface-overlay);
		color: white;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-xs);
		padding: 2px;
	}
	
	
	.brand-modal-subtitle {
		color: var(--color-text-muted);
		font-size: 0.875rem;
		margin-top: 0.25rem;
	}
	
	.brand-stats {
		display: flex;
		gap: 2rem;
		margin-top: 1rem;
	}
	
	.stat {
		display: flex;
		flex-direction: column;
	}
	
	.stat strong {
		font-size: 1.125rem;
		color: var(--color-text-dark);
	}
	
	.stat span {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	.brand-modal-actions {
		display: flex;
		gap: 1rem;
	}
	
	.follow-btn,
	.visit-store-btn {
		flex: 1;
		padding: 0.75rem;
		border-radius: 8px;
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.follow-btn {
		background: var(--color-brand-blue);
		color: white;
		border: none;
	}
	
	.follow-btn:hover {
		background: var(--color-interactive-primary-hover);
	}
	
	.visit-store-btn {
		background: white;
		color: var(--color-brand-blue);
		border: 2px solid var(--color-brand-blue);
	}
	
	.visit-store-btn:hover {
		background: var(--color-surface-brand-subtle);
	}
</style>