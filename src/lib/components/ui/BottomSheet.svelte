<script lang="ts">
	import { X } from '@lucide/svelte';
	import { browser } from '$app/environment';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		title?: string;
		showHandle?: boolean;
		height?: 'auto' | 'half' | 'full';
		children?: import('svelte').Snippet;
	}

	let {
		isOpen,
		onClose,
		title = '',
		showHandle = true,
		height = 'auto',
		children
	}: Props = $props();

	let bottomSheetElement: HTMLDivElement | null = null;
	let contentElement: HTMLDivElement | null = null;
	let startY = 0;
	let currentY = 0;
	let isDragging = false;
	let transform = $state(0);
	let dragVelocity = 0;
	let lastY = 0;
	let lastTime = 0;

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	// Haptic feedback helper
	function hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
		if (browser && 'vibrate' in navigator) {
			const patterns = {
				light: [10],
				medium: [20],
				heavy: [30]
			};
			navigator.vibrate(patterns[type]);
		}
	}

	// Touch/drag handlers
	function handleStart(event: TouchEvent | MouseEvent) {
		if (!isOpen || !bottomSheetElement) return;

		isDragging = true;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		startY = clientY;
		currentY = clientY;
		lastY = clientY;
		lastTime = Date.now();
		dragVelocity = 0;
		
		bottomSheetElement.style.transition = 'none';
		
		// Light haptic feedback on drag start
		hapticFeedback('light');
	}

	function handleMove(event: TouchEvent | MouseEvent) {
		if (!isDragging || !bottomSheetElement) return;

		event.preventDefault();
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const now = Date.now();
		
		// Calculate velocity for momentum-based closing
		if (now - lastTime > 16) { // Throttle to ~60fps
			dragVelocity = (clientY - lastY) / (now - lastTime);
			lastY = clientY;
			lastTime = now;
		}
		
		currentY = clientY;
		
		let deltaY = currentY - startY;
		
		// Rubber band effect for upward drag
		if (deltaY < 0) {
			deltaY = deltaY * 0.3; // Reduce upward movement
		} else {
			// Apply resistance for large downward drags
			deltaY = deltaY > 200 ? 200 + (deltaY - 200) * 0.5 : deltaY;
		}
		
		transform = Math.max(0, deltaY);
		bottomSheetElement.style.transform = `translateY(${transform}px)`;
		
		// Visual feedback when approaching close threshold
		if (transform > 100) {
			bottomSheetElement.style.opacity = String(Math.max(0.5, 1 - transform / 300));
		} else {
			bottomSheetElement.style.opacity = '1';
		}
	}

	function handleEnd() {
		if (!isDragging || !bottomSheetElement) return;

		isDragging = false;
		
		// Enhanced spring animation
		bottomSheetElement.style.transition = 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
		bottomSheetElement.style.opacity = '1'; // Reset opacity

		const deltaY = currentY - startY;
		const velocityThreshold = 0.5; // pixels per ms
		const distanceThreshold = 120;
		
		// Momentum-based closing: consider both distance and velocity
		const shouldClose = deltaY > distanceThreshold || 
						   (deltaY > 50 && dragVelocity > velocityThreshold);

		if (shouldClose) {
			// Medium haptic feedback on close
			hapticFeedback('medium');
			onClose();
		} else {
			// Light haptic feedback on snap back
			hapticFeedback('light');
			// Snap back to position with spring animation
			transform = 0;
			bottomSheetElement.style.transform = 'translateY(0px)';
		}
		
		// Reset velocity tracking
		dragVelocity = 0;
	}

	// Prevent body scroll when bottom sheet is open
	$effect(() => {
		if (browser) {
			if (isOpen) {
				document.body.style.overflow = 'hidden';
				document.addEventListener('keydown', handleKeydown);
			} else {
				document.body.style.overflow = '';
				document.removeEventListener('keydown', handleKeydown);
				
				// Reset transform when closing
				if (bottomSheetElement) {
					bottomSheetElement.style.transform = '';
					bottomSheetElement.style.transition = '';
				}
				transform = 0;
			}

			return () => {
				document.body.style.overflow = '';
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});

	// Add touch event listeners
	$effect(() => {
		if (browser && bottomSheetElement) {
			const element = bottomSheetElement;
			
			// Touch events
			element.addEventListener('touchstart', handleStart, { passive: false });
			element.addEventListener('touchmove', handleMove, { passive: false });
			element.addEventListener('touchend', handleEnd);
			
			// Mouse events for desktop testing
			element.addEventListener('mousedown', handleStart);
			document.addEventListener('mousemove', handleMove);
			document.addEventListener('mouseup', handleEnd);

			return () => {
				element.removeEventListener('touchstart', handleStart);
				element.removeEventListener('touchmove', handleMove);
				element.removeEventListener('touchend', handleEnd);
				element.removeEventListener('mousedown', handleStart);
				document.removeEventListener('mousemove', handleMove);
				document.removeEventListener('mouseup', handleEnd);
			};
		}
	});
</script>

<!-- Bottom Sheet Overlay -->
{#if isOpen}
	<div
		class="bottom-sheet-overlay"
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'bottom-sheet-title' : undefined}
	>
		<div
			bind:this={bottomSheetElement}
			class="bottom-sheet {height}"
			class:dragging={isDragging}
		>
			<!-- Drag Handle -->
			{#if showHandle}
				<div class="bottom-sheet-handle">
					<div class="handle-bar"></div>
				</div>
			{/if}

			<!-- Header -->
			{#if title}
				<div class="bottom-sheet-header">
					<h2 id="bottom-sheet-title" class="bottom-sheet-title">{title}</h2>
					<button class="close-button" onclick={onClose} aria-label="Close">
						<X size={20} />
					</button>
				</div>
			{/if}

			<!-- Content -->
			<div bind:this={contentElement} class="bottom-sheet-content">
				{#if children}
					{@render children()}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.bottom-sheet-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 9999;
		display: flex;
		align-items: flex-end;
		animation: fadeIn 0.3s ease-out;
	}

	.bottom-sheet {
		width: 100%;
		background: white;
		border-radius: 20px 20px 0 0;
		box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.2);
		transform: translateY(0);
		transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
		animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
		overflow: hidden;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
	}

	.bottom-sheet.auto {
		min-height: auto;
	}

	.bottom-sheet.half {
		height: 50vh;
		min-height: 300px;
	}

	.bottom-sheet.full {
		height: 90vh;
	}

	.bottom-sheet.dragging {
		transition: none;
	}

	.bottom-sheet-handle {
		display: flex;
		justify-content: center;
		padding: 12px 0 8px 0;
		cursor: grab;
		user-select: none;
	}

	.bottom-sheet-handle:active {
		cursor: grabbing;
	}

	.handle-bar {
		width: 40px;
		height: 4px;
		background: #d1d5db;
		border-radius: 2px;
		transition: background-color 0.2s ease;
	}

	.bottom-sheet-handle:hover .handle-bar {
		background: #9ca3af;
	}

	.bottom-sheet-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid #f1f3f4;
		flex-shrink: 0;
	}

	.bottom-sheet-title {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin: 0;
	}

	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: #f3f4f6;
		border-radius: 50%;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.close-button:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.close-button:active {
		transform: scale(0.95);
	}

	.bottom-sheet-content {
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	/* Animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.bottom-sheet {
			border-radius: 16px 16px 0 0;
		}

		.bottom-sheet-header {
			padding: 12px 16px;
		}

		.bottom-sheet-title {
			font-size: 16px;
		}
	}

	/* Desktop adaptations */
	@media (min-width: 768px) {
		.bottom-sheet-overlay {
			align-items: center;
			justify-content: center;
		}

		.bottom-sheet {
			width: 100%;
			max-width: 500px;
			border-radius: 16px;
			animation: scaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
			max-height: 80vh;
		}

		.bottom-sheet-handle {
			display: none;
		}

		@keyframes scaleIn {
			from {
				opacity: 0;
				transform: scale(0.9);
			}
			to {
				opacity: 1;
				transform: scale(1);
			}
		}
	}

	/* Accessibility improvements */
	@media (prefers-reduced-motion: reduce) {
		.bottom-sheet-overlay,
		.bottom-sheet {
			animation: none;
		}

		.bottom-sheet {
			transition: none;
		}
	}

	/* Focus management */
	.bottom-sheet:focus {
		outline: none;
	}

	/* Safe area support for iOS */
	@supports (padding-bottom: env(safe-area-inset-bottom)) {
		.bottom-sheet-content {
			padding-bottom: env(safe-area-inset-bottom);
		}
	}
</style>