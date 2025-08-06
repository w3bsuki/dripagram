import type { ListingData } from '$lib/services/listingService';

export interface SellFormData extends Partial<ListingData> {
	title: string;
	description: string;
	price: number;
	brand: string;
	size: string;
	condition: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair';
	color: string;
	material: string;
	location: string;
	shipping_available: boolean;
	shipping_price: number;
	tags: string[];
	images: string[];
}

export interface CategorySelectorProps {
	selectedCategory: string;
	onCategorySelect: (categoryId: string) => void;
}

export interface ProductImageUploaderProps {
	images: string[];
	userId: string;
	onImagesChange: (images: string[]) => void;
}

export interface ProductDetailsFormProps {
	title: string;
	description: string;
	price: number;
	brand: string;
	size: string;
	condition: string;
	color: string;
	material: string;
	selectedCategory: string;
	showCustomBrand: boolean;
	customBrand: string;
	onFieldChange: (field: string, value: any) => void;
	onCustomBrandToggle: (show: boolean) => void;
}

export interface ConditionSelectorProps {
	selectedCondition: string;
	onConditionSelect: (condition: string) => void;
}

export interface ShippingOptionsProps {
	location: string;
	shippingAvailable: boolean;
	shippingPrice: number;
	tags: string[];
	onLocationChange: (location: string) => void;
	onShippingToggle: (available: boolean) => void;
	onShippingPriceChange: (price: number) => void;
	onTagAdd: (tag: string) => void;
	onTagRemove: (tag: string) => void;
}

export interface ListingPreviewProps {
	listing: SellFormData;
	selectedCategory: string;
}

export interface SellFormProps {
	userId: string;
}

export interface StepIndicatorProps {
	currentStep: number;
	totalSteps: number;
}

export interface FormNavigationProps {
	currentStep: number;
	totalSteps: number;
	loading: boolean;
	onNext: () => void;
	onPrev: () => void;
	onPublish: () => void;
}
