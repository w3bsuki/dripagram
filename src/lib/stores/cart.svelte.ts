import { browser } from '$app/environment';

export interface CartItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image: string;
	size?: string;
	sellerId: string;
}

function createCartStore() {
	// Initialize items from localStorage
	let initialItems: CartItem[] = [];
	if (browser) {
		const savedCart = localStorage.getItem('cart');
		if (savedCart) {
			try {
				initialItems = JSON.parse(savedCart);
			} catch (e) {
			}
		}
	}
	
	let items = $state<CartItem[]>(initialItems);
	
	// Create a derived state for persistence
	let persist = $derived(() => {
		if (browser) {
			localStorage.setItem('cart', JSON.stringify(items));
		}
		return items;
	});
	
	return {
		get items() {
			return items;
		},
		
		addItem(item: Omit<CartItem, 'quantity'>) {
			const existingItem = items.find(i => i.id === item.id && i.size === item.size);
			
			if (existingItem) {
				existingItem.quantity += 1;
				items = [...items]; // Trigger reactivity
			} else {
				items = [...items, { ...item, quantity: 1 }];
			}
		},
		
		removeItem(itemId: string) {
			items = items.filter(item => item.id !== itemId);
		},
		
		updateQuantity(itemId: string, quantity: number) {
			const item = items.find(i => i.id === itemId);
			if (item) {
				item.quantity = Math.max(0, quantity);
				if (item.quantity === 0) {
					this.removeItem(itemId);
				} else {
					items = [...items]; // Trigger reactivity
				}
			}
		},
		
		clearCart() {
			items = [];
		},
		
		get count() {
			return items.reduce((sum, item) => sum + item.quantity, 0);
		},
		
		get subtotal() {
			return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
		},
		
		get tax() {
			// Simple 10% tax calculation - adjust based on requirements
			return this.subtotal * 0.1;
		},
		
		get shipping() {
			// Free shipping over $50
			return this.subtotal > 50 ? 0 : 5.99;
		},
		
		get total() {
			return this.subtotal + this.tax + this.shipping;
		}
	};
}

export const cartStore = createCartStore();