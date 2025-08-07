export interface Product {
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

export interface ProductGridProps {
	products?: Product[];
	searchQuery?: string;
	selectedCategory?: string | null;
	filterBy?: string | null;
	onProductClick?: (productId: string) => void;
	onLikeToggle?: (product: Product) => void;
	onQuickView?: (product: Product) => void;
	onAddToBag?: (product: Product) => void;
}

export interface ProductGridCardProps {
	product: Product;
	onProductClick?: (productId: string) => void;
	onLikeToggle?: (product: Product) => void;
	onQuickView?: (product: Product) => void;
	onAddToBag?: (product: Product) => void;
}

export interface ProductGridActionsProps {
	product: Product;
	onLikeToggle?: (product: Product) => void;
	onQuickView?: (product: Product) => void;
	onAddToBag?: (product: Product) => void;
}

export interface ProductGridSearchProps {
	searchQuery: string;
	showCategories: boolean;
	onSearchChange: (query: string) => void;
	onCategoriesToggle: () => void;
	onCategorySelect: (category: string) => void;
	onFilterSelect: (filter: string) => void;
}

export interface ProductGridFiltersProps {
	showCategories: boolean;
	onCategorySelect: (category: string) => void;
	onFilterSelect: (filter: string) => void;
}