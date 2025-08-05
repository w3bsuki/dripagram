import { browser } from '$app/environment';
import type { Product } from './productService';

// Types
export type CartItem = {
	product: Product;
	quantity: number;
	addedAt: string;
};

export type Cart = {
	items: CartItem[];
	total: number;
	count: number;
};

const CART_KEY = 'driplo_cart';

/**
 * Get cart from localStorage
 */
export function getCart(): Cart {
	if (!browser) return { items: [], total: 0, count: 0 };
	
	const stored = localStorage.getItem(CART_KEY);
	if (!stored) return { items: [], total: 0, count: 0 };
	
	try {
		const items: CartItem[] = JSON.parse(stored);
		return {
			items,
			total: calculateTotal(items),
			count: items.reduce((sum, item) => sum + item.quantity, 0)
		};
	} catch {
		return { items: [], total: 0, count: 0 };
	}
}

/**
 * Add item to cart
 */
export function addToCart(product: Product, quantity: number = 1): Cart {
	if (!browser) return getCart();
	
	const cart = getCart();
	const existingIndex = cart.items.findIndex(item => item.product.id === product.id);
	
	if (existingIndex >= 0) {
		// Update quantity if item exists
		cart.items[existingIndex].quantity += quantity;
	} else {
		// Add new item
		cart.items.push({
			product,
			quantity,
			addedAt: new Date().toISOString()
		});
	}
	
	saveCart(cart.items);
	return getCart();
}

/**
 * Remove item from cart
 */
export function removeFromCart(productId: string): Cart {
	if (!browser) return getCart();
	
	const cart = getCart();
	cart.items = cart.items.filter(item => item.product.id !== productId);
	
	saveCart(cart.items);
	return getCart();
}

/**
 * Update item quantity
 */
export function updateQuantity(productId: string, quantity: number): Cart {
	if (!browser) return getCart();
	
	const cart = getCart();
	const item = cart.items.find(item => item.product.id === productId);
	
	if (item) {
		if (quantity <= 0) {
			return removeFromCart(productId);
		}
		item.quantity = quantity;
		saveCart(cart.items);
	}
	
	return getCart();
}

/**
 * Clear entire cart
 */
export function clearCart(): Cart {
	if (!browser) return { items: [], total: 0, count: 0 };
	
	localStorage.removeItem(CART_KEY);
	return { items: [], total: 0, count: 0 };
}

/**
 * Check if item is in cart
 */
export function isInCart(productId: string): boolean {
	const cart = getCart();
	return cart.items.some(item => item.product.id === productId);
}

/**
 * Get cart item count
 */
export function getCartCount(): number {
	const cart = getCart();
	return cart.count;
}

/**
 * Calculate cart total
 */
function calculateTotal(items: CartItem[]): number {
	return items.reduce((sum, item) => {
		return sum + (item.product.price * item.quantity);
	}, 0);
}

/**
 * Save cart to localStorage
 */
function saveCart(items: CartItem[]): void {
	if (!browser) return;
	localStorage.setItem(CART_KEY, JSON.stringify(items));
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
	return `${price.toFixed(2)} лв`;
}

/**
 * Get shipping cost based on items
 */
export function getShippingCost(items: CartItem[]): number {
	if (items.length === 0) return 0;
	
	// Free shipping over 100 BGN
	const total = calculateTotal(items);
	if (total >= 100) return 0;
	
	// Standard shipping: 5 BGN
	return 5;
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDelivery(): string {
	const date = new Date();
	date.setDate(date.getDate() + 3); // 3 days delivery
	
	const options: Intl.DateTimeFormatOptions = { 
		weekday: 'long', 
		month: 'long', 
		day: 'numeric' 
	};
	
	return date.toLocaleDateString('bg-BG', options);
}