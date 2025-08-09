// Phase 4 Monetization Types
// Additional types for payment processing and subscriptions

export interface Transaction {
	id: string;
	transaction_id: string;
	listing_id: string;
	buyer_id: string;
	seller_id: string;
	item_price: number;
	shipping_price: number;
	platform_fee: number;
	payment_processing_fee: number;
	total_amount: number;
	seller_earnings: number;
	currency: string;
	status: TransactionStatus;
	payment_method: PaymentMethod;
	notes?: string;
	tracking_number?: string;
	shipped_at?: string;
	delivered_at?: string;
	created_at: string;
	updated_at: string;
}

export type TransactionStatus = 
	| 'pending'
	| 'processing'
	| 'completed'
	| 'failed'
	| 'cancelled'
	| 'refunded'
	| 'partially_refunded';

export type PaymentMethod = 
	| 'stripe'
	| 'paypal'
	| 'bank_transfer'
	| 'wallet';

export interface Payment {
	id: string;
	transaction_id: string;
	stripe_payment_intent_id?: string;
	stripe_charge_id?: string;
	amount: number;
	currency: string;
	status: string;
	payment_method_details?: any;
	failure_reason?: string;
	receipt_url?: string;
	created_at: string;
	updated_at: string;
}

export interface SellerWallet {
	id: string;
	seller_id: string;
	available_balance: number;
	pending_balance: number;
	total_earnings: number;
	total_withdrawn: number;
	currency: string;
	payout_method?: string;
	bank_account_details?: any;
	paypal_email?: string;
	created_at: string;
	updated_at: string;
}

export interface WalletTransaction {
	id: string;
	wallet_id: string;
	transaction_id?: string;
	type: 'credit' | 'debit';
	amount: number;
	currency: string;
	description: string;
	reference_id?: string;
	created_at: string;
}

export interface PlatformCommission {
	id: string;
	transaction_id: string;
	commission_rate: number;
	commission_amount: number;
	currency: string;
	commission_type: string;
	notes?: string;
	created_at: string;
}

export interface SubscriptionPlan {
	id: string;
	name: string;
	slug: string;
	description?: string;
	monthly_price: number;
	yearly_price: number;
	currency: string;
	max_listings: number; // -1 for unlimited
	max_images_per_listing: number;
	featured_listings_per_month: number;
	promoted_listings_per_month: number;
	analytics_access: boolean;
	priority_support: boolean;
	custom_branding: boolean;
	bulk_upload: boolean;
	advanced_filters: boolean;
	commission_rate?: number;
	features?: any;
	is_active: boolean;
	display_order: number;
	stripe_product_id?: string;
	stripe_monthly_price_id?: string;
	stripe_yearly_price_id?: string;
	created_at: string;
	updated_at: string;
}

export interface SellerSubscription {
	id: string;
	seller_id: string;
	plan_id: string;
	status: SubscriptionStatus;
	billing_cycle: 'monthly' | 'yearly';
	current_price: number;
	currency: string;
	listings_used: number;
	featured_listings_used: number;
	promoted_listings_used: number;
	trial_ends_at?: string;
	current_period_start: string;
	current_period_end: string;
	next_billing_date?: string;
	stripe_subscription_id?: string;
	stripe_customer_id?: string;
	cancel_at_period_end: boolean;
	cancelled_at?: string;
	cancellation_reason?: string;
	created_at: string;
	updated_at: string;
}

export type SubscriptionStatus = 
	| 'active'
	| 'inactive'
	| 'past_due'
	| 'cancelled'
	| 'unpaid'
	| 'trialing';

export interface SubscriptionUsage {
	id: string;
	subscription_id: string;
	feature_type: string;
	resource_id?: string;
	usage_count: number;
	billing_period_start: string;
	billing_period_end: string;
	metadata?: any;
	created_at: string;
}

export interface ListingPromotion {
	id: string;
	listing_id: string;
	seller_id: string;
	subscription_id?: string;
	promotion_type: 'featured' | 'promoted' | 'sponsored';
	status: 'active' | 'paused' | 'expired' | 'cancelled';
	cost: number;
	currency: string;
	payment_method: 'subscription' | 'one_time' | 'wallet';
	starts_at: string;
	ends_at: string;
	impression_count: number;
	click_count: number;
	conversion_count: number;
	target_categories?: string[];
	target_locations?: string[];
	target_demographics?: any;
	daily_budget?: number;
	total_budget?: number;
	spent_amount: number;
	created_at: string;
	updated_at: string;
}

export interface SellerAnalytics {
	id: string;
	seller_id: string;
	date: string;
	profile_views: number;
	listing_views: number;
	listing_likes: number;
	listing_shares: number;
	messages_received: number;
	conversions: number;
	gross_sales: number;
	net_earnings: number;
	platform_fees: number;
	active_listings: number;
	new_listings: number;
	sold_listings: number;
	expired_listings: number;
	response_time_minutes?: number;
	response_rate?: number;
	search_impressions: number;
	search_clicks: number;
	search_rank_average?: number;
	created_at: string;
	updated_at: string;
}

export interface FraudAssessment {
	id: string;
	transaction_id?: string;
	user_id: string;
	listing_id?: string;
	risk_score: number;
	risk_level: RiskLevel;
	status: FraudStatus;
	triggered_rules?: string[];
	risk_factors?: any;
	ml_fraud_score?: number;
	identity_verification_score?: number;
	behavioral_score?: number;
	device_fingerprint_score?: number;
	decision?: 'approve' | 'review' | 'decline' | 'pending';
	decision_reason?: string;
	reviewer_id?: string;
	reviewed_at?: string;
	assessment_data?: any;
	external_scores?: any;
	created_at: string;
	updated_at: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FraudStatus = 'clean' | 'suspicious' | 'flagged' | 'blocked' | 'reviewed';

export interface UserRiskProfile {
	id: string;
	user_id: string;
	risk_score: number;
	risk_level: RiskLevel;
	trust_score: number;
	avg_transaction_amount: number;
	transaction_frequency: number;
	unusual_activity_count: number;
	identity_verified: boolean;
	identity_verification_level: number;
	phone_verified: boolean;
	email_verified: boolean;
	address_verified: boolean;
	device_count: number;
	location_count: number;
	login_pattern_score: number;
	total_transactions: number;
	successful_transactions: number;
	disputed_transactions: number;
	refund_rate: number;
	account_age_days: number;
	days_since_last_activity: number;
	profile_completion_score: number;
	credit_score?: number;
	social_media_verification?: any;
	external_identity_checks?: any;
	manual_review_flag: boolean;
	whitelist_flag: boolean;
	blacklist_flag: boolean;
	notes?: string;
	last_assessed_at: string;
	created_at: string;
	updated_at: string;
}

export interface PaymentDispute {
	id: string;
	transaction_id: string;
	disputed_by: string;
	dispute_type: DisputeType;
	amount: number;
	currency: string;
	status: DisputeStatus;
	stripe_dispute_id?: string;
	chargeback_id?: string;
	buyer_evidence?: any;
	seller_evidence?: any;
	platform_evidence?: any;
	resolution?: string;
	resolved_amount: number;
	resolved_by?: string;
	resolved_at?: string;
	buyer_contacted_at?: string;
	seller_contacted_at?: string;
	response_deadline?: string;
	created_at: string;
	updated_at: string;
}

export type DisputeType = 
	| 'chargeback'
	| 'refund_request'
	| 'item_not_received'
	| 'item_not_as_described'
	| 'unauthorized'
	| 'fraud';

export type DisputeStatus = 
	| 'open'
	| 'investigating'
	| 'resolved'
	| 'escalated'
	| 'closed';

// API Response Types
export interface PaymentIntentResponse {
	success: boolean;
	transactionId: string;
	paymentIntent: {
		id: string;
		clientSecret: string;
		amount: number;
		currency: string;
		status: string;
	};
	fees: {
		itemPrice: number;
		shippingPrice: number;
		platformFee: number;
		paymentProcessingFee: number;
		totalAmount: number;
	};
	listing: {
		id: string;
		title: string;
		price: number;
		currency: string;
		images: string[];
		seller: {
			name: string;
			verified: boolean;
		};
	};
}

export interface RevenueAnalyticsResponse {
	success: boolean;
	data: {
		period: string;
		dateRange: {
			start: string;
			end: string;
		};
		transactions: {
			totalTransactions: number;
			completedTransactions: number;
			failedTransactions: number;
			pendingTransactions: number;
			totalRevenue: number;
			totalEarnings: number;
			totalFeesPaid: number;
			averageOrderValue: number;
			successRate: number;
		};
		listings: {
			totalListings: number;
			activeListings: number;
			soldListings: number;
			expiredListings: number;
			totalViews: number;
			totalLikes: number;
			totalShares: number;
			averageViewsPerListing: number;
			soldRate: number;
		};
		wallet: SellerWallet;
		timeSeries: Array<{
			date: string;
			revenue: number;
			earnings: number;
			transactions: number;
			views: number;
			likes: number;
			newListings: number;
		}>;
		summary: {
			totalRevenue: number;
			totalTransactions: number;
			averageOrderValue: number;
			conversionRate: number;
			topPerformingListings: Array<{
				id: string;
				title: string;
				price: number;
				views: number;
				likes: number;
				soldAt: string;
			}>;
		};
	};
}

// Utility Types
export interface TransactionFees {
	itemPrice: number;
	shippingPrice: number;
	platformFee: number;
	paymentProcessingFee: number;
	totalAmount: number;
	sellerEarnings: number;
}