// User and Profile Types
export interface User {
	id: string;
	email: string;
	username: string;
	avatar_url?: string;
	onboarding_completed?: boolean;
	account_type?: 'personal' | 'brand';
	brand_name?: string;
	brand_logo_url?: string;
	created_at: string;
}

export interface Profile {
	id: string;
	username: string;
	full_name?: string;
	avatar_url?: string;
	bio?: string;
	phone?: string;
	email?: string;
	address?: string;
	city?: string;
	postal_code?: string;
	country?: string;
	seller_rating?: number;
	seller_rating_count?: number;
	seller_verified?: boolean;
	seller_verified_at?: string;
	seller_badge?: string;
	total_sales?: number;
	total_earnings?: number;
	follower_count?: number;
	following_count?: number;
	listing_count?: number;
	collection_count?: number;
	is_influencer?: boolean;
	style_tags?: string[];
	social_links?: Record<string, string>;
	role?: 'user' | 'seller' | 'admin' | 'moderator';
	status?: 'active' | 'suspended' | 'banned' | 'deleted';
	last_seen_at?: string;
	created_at: string;
	updated_at: string;
}

// Product/Listing Types
export interface Listing {
	id: string;
	seller_id: string;
	category_id?: string;
	title: string;
	description?: string;
	price: number;
	original_price?: number;
	currency?: string;
	brand?: string;
	size?: string;
	color?: string;
	material?: string;
	condition?: 'new_with_tags' | 'new_without_tags' | 'like_new' | 'very_good' | 'good' | 'fair';
	images?: string[];
	thumbnail_url?: string;
	video_url?: string;
	has_video?: boolean;
	location?: string;
	city?: string;
	postal_code?: string;
	shipping_available?: boolean;
	shipping_price?: number;
	shipping_methods?: string[];
	status?: 'draft' | 'active' | 'sold' | 'reserved' | 'expired' | 'deleted';
	is_featured?: boolean;
	is_promoted?: boolean;
	view_count?: number;
	like_count?: number;
	share_count?: number;
	tags?: string[];
	style_tags?: string[];
	occasion?: string;
	season?: string;
	sustainability_score?: number;
	created_at: string;
	updated_at: string;
	published_at?: string;
	sold_at?: string;
	expires_at?: string;
}

// Category Type
export interface Category {
	id: string;
	name: string;
	slug: string;
	parent_id?: string;
	icon?: string;
	icon_url?: string;
	description?: string;
	display_order?: number;
	is_active?: boolean;
	meta_title?: string;
	meta_description?: string;
	created_at: string;
	updated_at: string;
}

// Social Features Types
export interface Follow {
	id: string;
	follower_id: string;
	following_id: string;
	created_at: string;
}

export interface Like {
	id: string;
	user_id: string;
	listing_id: string;
	created_at: string;
}

export interface Collection {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	cover_image?: string;
	is_public?: boolean;
	item_count?: number;
	follower_count?: number;
	created_at: string;
	updated_at: string;
}

export interface CollectionItem {
	id: string;
	collection_id: string;
	listing_id: string;
	added_by: string;
	note?: string;
	position?: number;
	created_at: string;
}

export interface Hashtag {
	id: string;
	name: string;
	slug: string;
	usage_count?: number;
	trending_score?: number;
	category?: string;
	created_at: string;
	updated_at: string;
}

// Messaging Types
export interface Message {
	id: string;
	sender_id: string;
	receiver_id: string;
	listing_id?: string;
	content: string;
	is_read?: boolean;
	read_at?: string;
	created_at: string;
}

// Review Type
export interface Review {
	id: string;
	reviewer_id: string;
	reviewed_id: string;
	listing_id?: string;
	rating: number;
	comment?: string;
	is_buyer?: boolean;
	created_at: string;
	updated_at: string;
}

// Shopping Types
export interface CartItem {
	id: string;
	user_id: string;
	listing_id: string;
	quantity?: number;
	size?: string;
	color?: string;
	added_at: string;
}

export interface WishlistItem {
	id: string;
	user_id: string;
	listing_id: string;
	price_alert?: number;
	size_alert?: string;
	created_at: string;
}

// Notification Type
export interface Notification {
	id: string;
	user_id: string;
	type:
		| 'new_message'
		| 'new_order'
		| 'listing_liked'
		| 'review_received'
		| 'price_drop'
		| 'new_follower';
	title: string;
	body?: string;
	link?: string;
	is_read?: boolean;
	created_at: string;
}

// Activity Feed Type
export interface ActivityFeedItem {
	id: string;
	user_id: string;
	actor_id: string;
	type: 'follow' | 'like' | 'listing' | 'collection' | 'review' | 'share';
	target_type?: 'user' | 'listing' | 'collection' | 'review';
	target_id?: string;
	metadata?: Record<string, any>;
	created_at: string;
}

// Trending Item Type
export interface TrendingItem {
	id: string;
	type: 'listing' | 'hashtag' | 'collection' | 'user';
	item_id: string;
	score?: number;
	view_count?: number;
	like_count?: number;
	share_count?: number;
	time_window?: 'hourly' | 'daily' | 'weekly' | 'monthly';
	created_at: string;
	updated_at: string;
}
