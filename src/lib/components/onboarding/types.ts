export interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	icon: any;
	completed: boolean;
}

export interface Address {
	street: string;
	city: string;
	postal_code: string;
	country: string;
}

export interface SocialLinks {
	instagram: string;
	facebook: string;
	twitter: string;
}

export interface ProfileData {
	full_name: string;
	phone: string;
	address: Address;
	bio: string;
	website: string;
	social_links: SocialLinks;
}

export interface BrandData {
	brand_description: string;
	brand_website: string;
	brand_category: string;
}

export interface PayoutData {
	method: string;
	bank_name: string;
	iban: string;
	account_holder: string;
}

export interface NotificationPreferences {
	email: boolean;
	push: boolean;
	sms: boolean;
}

export interface PrivacyPreferences {
	show_online_status: boolean;
	show_location: boolean;
}

export interface Preferences {
	newsletter: boolean;
	notifications: NotificationPreferences;
	privacy: PrivacyPreferences;
}

export interface OnboardingData {
	profile: ProfileData;
	brand: BrandData;
	payout: PayoutData;
	preferences: Preferences;
}
