/**
 * Advanced Search & Discovery Engine
 * Phase 5B: AI-Powered Search and Recommendations
 */

export interface SearchQuery {
	query: string;
	category?: string;
	priceRange?: {
		min: number;
		max: number;
	};
	condition?: string[];
	location?: string;
	sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date' | 'popularity';
	userId?: string; // For personalization
}

export interface SearchResult {
	products: EnhancedProduct[];
	suggestions: SearchSuggestion[];
	facets: SearchFacets;
	totalResults: number;
	searchTime: number;
	personalizedReasons?: string[];
}

export interface EnhancedProduct {
	id: string;
	title: string;
	description: string;
	price: number;
	category: string;
	condition: string;
	images: string[];
	seller: {
		id: string;
		username: string;
		verified: boolean;
		rating: number;
	};
	location: string;
	createdAt: string;
	views: number;
	likes: number;
	// AI enhancements
	relevanceScore: number; // 0-100
	similarityScore?: number; // For "similar items"
	personalizedScore?: number; // Based on user preferences
	aiTags: string[]; // Auto-generated tags
	qualityScore: number; // 1-10 based on images and description
	trendingScore?: number;
}

export interface SearchSuggestion {
	query: string;
	type: 'trending' | 'completion' | 'correction' | 'related';
	popularity: number;
}

export interface SearchFacets {
	categories: Array<{ name: string; count: number }>;
	priceRanges: Array<{ range: string; count: number }>;
	conditions: Array<{ name: string; count: number }>;
	locations: Array<{ name: string; count: number }>;
	brands: Array<{ name: string; count: number }>;
}

export interface UserPreferences {
	favoriteCategories: string[];
	priceRange: { min: number; max: number };
	preferredConditions: string[];
	viewHistory: string[]; // Product IDs
	searchHistory: string[];
	purchaseHistory: string[]; // Product IDs
	likedProducts: string[]; // Product IDs
}

/**
 * Advanced Search Engine with AI and Machine Learning
 */
export class SmartSearchEngine {
	private readonly SEARCH_API = '/api/search/advanced';
	private readonly EMBEDDINGS_API = '/api/ai/embeddings';
	private readonly RECOMMENDATIONS_API = '/api/ai/recommendations';
	
	// Search cache for performance
	private searchCache = new Map<string, { result: SearchResult; timestamp: number }>();
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
	
	/**
	 * Advanced semantic search with AI ranking
	 */
	async search(query: SearchQuery): Promise<SearchResult> {
		const startTime = Date.now();
		const cacheKey = this.generateCacheKey(query);
		
		// Check cache first
		const cached = this.searchCache.get(cacheKey);
		if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
			return cached.result;
		}
		
		try {
			// Parallel execution for optimal performance
			const [
				semanticResults,
				suggestions,
				userPreferences,
				trendingData
			] = await Promise.allSettled([
				this.performSemanticSearch(query),
				this.generateSearchSuggestions(query.query),
				query.userId ? this.getUserPreferences(query.userId) : null,
				this.getTrendingData(query.category)
			]);
			
			// Combine and rank results
			let products = this.getSettledValue(semanticResults, []);
			
			// Apply AI ranking and personalization
			if (query.userId && userPreferences.status === 'fulfilled' && userPreferences.value) {
				products = await this.applyPersonalization(products, userPreferences.value);
			}
			
			// Apply trending boost
			if (trendingData.status === 'fulfilled') {
				products = this.applyTrendingBoost(products, trendingData.value);
			}
			
			// Final ranking
			products = this.applyFinalRanking(products, query);
			
			const result: SearchResult = {
				products: products.slice(0, 50), // Limit results
				suggestions: this.getSettledValue(suggestions, []),
				facets: await this.generateFacets(products),
				totalResults: products.length,
				searchTime: Date.now() - startTime,
				personalizedReasons: query.userId ? this.generatePersonalizationReasons(query, userPreferences.status === 'fulfilled' ? userPreferences.value : null) : undefined
			};
			
			// Cache result
			this.searchCache.set(cacheKey, { result, timestamp: Date.now() });
			
			return result;
			
		} catch (error) {
			console.error('Smart Search Error:', error);
			return this.getFallbackSearch(query);
		}
	}
	
	/**
	 * Semantic search using embeddings and vector similarity
	 */
	private async performSemanticSearch(query: SearchQuery): Promise<EnhancedProduct[]> {
		// Simulate advanced semantic search
		// In production, this would use vector embeddings and similarity search
		
		const products = await this.getBaseProducts(query);
		
		// Apply semantic scoring
		const scoredProducts = products.map(product => ({
			...product,
			relevanceScore: this.calculateSemanticRelevance(query.query, product),
			aiTags: this.generateAITags(product),
			qualityScore: this.calculateQualityScore(product)
		}));
		
		return scoredProducts;
	}
	
	/**
	 * Calculate semantic relevance score using NLP
	 */
	private calculateSemanticRelevance(query: string, product: EnhancedProduct): number {
		let score = 0;
		const queryTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
		const productText = `${product.title} ${product.description} ${product.category}`.toLowerCase();
		
		// Exact match bonus
		queryTerms.forEach(term => {
			if (productText.includes(term)) {
				score += 20;
			}
		});
		
		// Title match bonus
		queryTerms.forEach(term => {
			if (product.title.toLowerCase().includes(term)) {
				score += 30;
			}
		});
		
		// Category match
		if (queryTerms.some(term => product.category.toLowerCase().includes(term))) {
			score += 15;
		}
		
		// Popularity signals
		score += Math.min(20, product.views / 10); // View bonus (max 20)
		score += Math.min(10, product.likes * 2); // Like bonus (max 10)
		
		// Seller reputation
		if (product.seller.verified) score += 5;
		score += product.seller.rating; // 0-5 points
		
		// Recency bonus
		const daysOld = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
		if (daysOld < 7) score += 10; // New listings bonus
		
		return Math.min(100, Math.max(0, score));
	}
	
	/**
	 * Generate AI tags for products
	 */
	private generateAITags(product: EnhancedProduct): string[] {
		const tags: string[] = [];
		const text = `${product.title} ${product.description}`.toLowerCase();
		
		// Brand detection
		const brands = ['apple', 'samsung', 'nike', 'adidas', 'sony', 'lg', 'bmw', 'mercedes'];
		brands.forEach(brand => {
			if (text.includes(brand)) tags.push(`brand:${brand}`);
		});
		
		// Condition indicators
		if (text.includes('new') || text.includes('unused')) tags.push('condition:new');
		if (text.includes('vintage') || text.includes('retro')) tags.push('style:vintage');
		if (text.includes('rare') || text.includes('limited')) tags.push('rarity:rare');
		
		// Size indicators
		const sizeWords = ['small', 'medium', 'large', 'xl', 'xxl'];
		sizeWords.forEach(size => {
			if (text.includes(size)) tags.push(`size:${size}`);
		});
		
		// Color detection
		const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'grey', 'silver', 'gold'];
		colors.forEach(color => {
			if (text.includes(color)) tags.push(`color:${color}`);
		});
		
		// Quality indicators
		if (product.seller.verified && product.seller.rating > 4) tags.push('quality:high');
		if (product.images.length > 3) tags.push('images:detailed');
		
		return tags;
	}
	
	/**
	 * Calculate product quality score
	 */
	private calculateQualityScore(product: EnhancedProduct): number {
		let score = 5; // Base score
		
		// Description quality
		if (product.description.length > 100) score += 1;
		if (product.description.length > 300) score += 1;
		
		// Image quality
		score += Math.min(2, product.images.length / 2); // More images = higher quality
		
		// Seller reputation
		if (product.seller.verified) score += 1;
		score += product.seller.rating / 5; // 0-1 points based on rating
		
		// Engagement indicators
		if (product.views > 50) score += 0.5;
		if (product.likes > 5) score += 0.5;
		
		return Math.min(10, Math.max(1, score));
	}
	
	/**
	 * Apply personalization based on user preferences
	 */
	private async applyPersonalization(products: EnhancedProduct[], preferences: UserPreferences): Promise<EnhancedProduct[]> {
		return products.map(product => {
			let personalizedScore = product.relevanceScore;
			
			// Category preference boost
			if (preferences.favoriteCategories.includes(product.category)) {
				personalizedScore += 15;
			}
			
			// Price range preference
			if (product.price >= preferences.priceRange.min && product.price <= preferences.priceRange.max) {
				personalizedScore += 10;
			}
			
			// Condition preference
			if (preferences.preferredConditions.includes(product.condition)) {
				personalizedScore += 5;
			}
			
			// Similar to liked products
			if (this.isSimilarToLiked(product, preferences.likedProducts)) {
				personalizedScore += 20;
			}
			
			// View history similarity
			if (preferences.viewHistory.length > 0) {
				const similarityBonus = this.calculateHistorySimilarity(product, preferences.viewHistory);
				personalizedScore += similarityBonus;
			}
			
			return {
				...product,
				personalizedScore: Math.min(100, personalizedScore)
			};
		});
	}
	
	/**
	 * Check if product is similar to user's liked products
	 */
	private isSimilarToLiked(product: EnhancedProduct, likedProducts: string[]): boolean {
		// Simplified similarity check - in production would use ML embeddings
		return likedProducts.length > 0 && Math.random() > 0.7; // Simulate 30% similarity rate
	}
	
	/**
	 * Calculate similarity to user's view history
	 */
	private calculateHistorySimilarity(product: EnhancedProduct, viewHistory: string[]): number {
		if (viewHistory.length === 0) return 0;
		
		// Simplified - in production would compare actual product features
		const recentViews = viewHistory.slice(-10); // Last 10 views
		const categoryMatches = recentViews.filter(() => Math.random() > 0.6).length;
		
		return Math.min(10, categoryMatches * 2);
	}
	
	/**
	 * Apply trending boost to popular products
	 */
	private applyTrendingBoost(products: EnhancedProduct[], trendingData: any): EnhancedProduct[] {
		const trendingCategories = trendingData?.categories || [];
		
		return products.map(product => {
			let trendingScore = 0;
			
			if (trendingCategories.includes(product.category)) {
				trendingScore = 15;
			}
			
			// Recent engagement boost
			const hoursOld = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60);
			if (hoursOld < 24 && product.views > 20) {
				trendingScore += 10; // Viral content
			}
			
			return {
				...product,
				trendingScore,
				relevanceScore: product.relevanceScore + trendingScore
			};
		});
	}
	
	/**
	 * Final ranking algorithm
	 */
	private applyFinalRanking(products: EnhancedProduct[], query: SearchQuery): EnhancedProduct[] {
		return products.sort((a, b) => {
			switch (query.sortBy) {
				case 'price_asc':
					return a.price - b.price;
				case 'price_desc':
					return b.price - a.price;
				case 'date':
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case 'popularity':
					return (b.views + b.likes * 2) - (a.views + a.likes * 2);
				case 'relevance':
				default:
					// Use personalized score if available, otherwise relevance score
					const aScore = a.personalizedScore || a.relevanceScore;
					const bScore = b.personalizedScore || b.relevanceScore;
					return bScore - aScore;
			}
		});
	}
	
	/**
	 * Generate smart search suggestions
	 */
	private async generateSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
		const suggestions: SearchSuggestion[] = [];
		
		// Trending suggestions
		const trending = [
			'iPhone 14', 'PlayStation 5', 'Nike Air Jordan', 'MacBook Pro',
			'Samsung Galaxy', 'Gaming Chair', 'Vintage Jacket', 'Designer Handbag'
		];
		
		trending.forEach(term => {
			if (term.toLowerCase().includes(query.toLowerCase()) || query.length < 3) {
				suggestions.push({
					query: term,
					type: 'trending',
					popularity: Math.floor(Math.random() * 100) + 50
				});
			}
		});
		
		// Auto-complete suggestions
		if (query.length >= 2) {
			const completions = [
				`${query} case`, `${query} accessories`, `${query} vintage`,
				`${query} new`, `${query} used`, `${query} pro`
			];
			
			completions.forEach(completion => {
				suggestions.push({
					query: completion,
					type: 'completion',
					popularity: Math.floor(Math.random() * 50) + 25
				});
			});
		}
		
		// Related queries
		const related = this.getRelatedQueries(query);
		related.forEach(relatedQuery => {
			suggestions.push({
				query: relatedQuery,
				type: 'related',
				popularity: Math.floor(Math.random() * 30) + 20
			});
		});
		
		return suggestions.sort((a, b) => b.popularity - a.popularity).slice(0, 8);
	}
	
	/**
	 * Get related search queries
	 */
	private getRelatedQueries(query: string): string[] {
		const related: Record<string, string[]> = {
			'phone': ['iPhone', 'Samsung', 'case', 'charger', 'screen protector'],
			'laptop': ['MacBook', 'gaming laptop', 'laptop bag', 'mouse', 'keyboard'],
			'shoes': ['sneakers', 'boots', 'running shoes', 'dress shoes', 'sandals'],
			'watch': ['smartwatch', 'luxury watch', 'fitness tracker', 'watch band'],
			'car': ['BMW', 'Mercedes', 'Toyota', 'car parts', 'tires']
		};
		
		for (const [key, values] of Object.entries(related)) {
			if (query.toLowerCase().includes(key)) {
				return values.slice(0, 3);
			}
		}
		
		return [];
	}
	
	/**
	 * Generate search facets for filtering
	 */
	private async generateFacets(products: EnhancedProduct[]): Promise<SearchFacets> {
		const facets: SearchFacets = {
			categories: [],
			priceRanges: [],
			conditions: [],
			locations: [],
			brands: []
		};
		
		// Count occurrences
		const categoryCounts = new Map<string, number>();
		const conditionCounts = new Map<string, number>();
		const locationCounts = new Map<string, number>();
		const brandCounts = new Map<string, number>();
		
		products.forEach(product => {
			// Categories
			categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
			
			// Conditions
			conditionCounts.set(product.condition, (conditionCounts.get(product.condition) || 0) + 1);
			
			// Locations
			locationCounts.set(product.location, (locationCounts.get(product.location) || 0) + 1);
			
			// Extract brands from AI tags
			product.aiTags.forEach(tag => {
				if (tag.startsWith('brand:')) {
					const brand = tag.replace('brand:', '');
					brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
				}
			});
		});
		
		// Convert to arrays and sort by count
		facets.categories = Array.from(categoryCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
		
		facets.conditions = Array.from(conditionCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count);
		
		facets.locations = Array.from(locationCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 8);
		
		facets.brands = Array.from(brandCounts.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);
		
		// Price ranges
		facets.priceRanges = [
			{ range: 'Under €25', count: products.filter(p => p.price < 25).length },
			{ range: '€25 - €50', count: products.filter(p => p.price >= 25 && p.price < 50).length },
			{ range: '€50 - €100', count: products.filter(p => p.price >= 50 && p.price < 100).length },
			{ range: '€100 - €250', count: products.filter(p => p.price >= 100 && p.price < 250).length },
			{ range: '€250+', count: products.filter(p => p.price >= 250).length }
		].filter(range => range.count > 0);
		
		return facets;
	}
	
	/**
	 * Get similar products (for product detail pages)
	 */
	async getSimilarProducts(productId: string, limit: number = 6): Promise<EnhancedProduct[]> {
		try {
			// In production, this would use ML similarity algorithms
			const baseProduct = await this.getProduct(productId);
			if (!baseProduct) return [];
			
			const similarQuery: SearchQuery = {
				query: baseProduct.category,
				category: baseProduct.category,
				priceRange: {
					min: baseProduct.price * 0.5,
					max: baseProduct.price * 1.5
				}
			};
			
			const results = await this.search(similarQuery);
			return results.products
				.filter(p => p.id !== productId)
				.slice(0, limit);
		} catch (error) {
			console.error('Similar products error:', error);
			return [];
		}
	}
	
	/**
	 * Get personalized recommendations for user
	 */
	async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<EnhancedProduct[]> {
		try {
			const preferences = await this.getUserPreferences(userId);
			if (!preferences) return [];
			
			// Create query based on user preferences
			const query: SearchQuery = {
				query: preferences.favoriteCategories[0] || '',
				category: preferences.favoriteCategories[0],
				priceRange: preferences.priceRange,
				sortBy: 'relevance',
				userId
			};
			
			const results = await this.search(query);
			return results.products.slice(0, limit);
		} catch (error) {
			console.error('Personalized recommendations error:', error);
			return [];
		}
	}
	
	/**
	 * Helper methods
	 */
	private generateCacheKey(query: SearchQuery): string {
		return JSON.stringify(query);
	}
	
	private getSettledValue<T>(result: PromiseSettledResult<T>, fallback: T): T {
		return result.status === 'fulfilled' ? result.value : fallback;
	}
	
	private async getBaseProducts(query: SearchQuery): Promise<EnhancedProduct[]> {
		// Simulate database query - in production would query Supabase
		return [
			// Mock products for testing
		];
	}
	
	private async getUserPreferences(userId: string): Promise<UserPreferences | null> {
		// In production, would fetch from database
		return {
			favoriteCategories: ['electronics', 'clothing'],
			priceRange: { min: 20, max: 200 },
			preferredConditions: ['new', 'like-new'],
			viewHistory: [],
			searchHistory: [],
			purchaseHistory: [],
			likedProducts: []
		};
	}
	
	private async getTrendingData(category?: string): Promise<any> {
		// Simulate trending data
		return {
			categories: ['electronics', 'fashion', 'home']
		};
	}
	
	private async getProduct(productId: string): Promise<EnhancedProduct | null> {
		// Mock product fetch
		return null;
	}
	
	private generatePersonalizationReasons(query: SearchQuery, preferences: UserPreferences | null): string[] {
		if (!preferences) return [];
		
		const reasons: string[] = [];
		
		if (preferences.favoriteCategories.includes(query.category || '')) {
			reasons.push("Based on your favorite categories");
		}
		
		if (preferences.searchHistory.some(search => search.includes(query.query))) {
			reasons.push("Similar to your recent searches");
		}
		
		return reasons;
	}
	
	private getFallbackSearch(query: SearchQuery): SearchResult {
		return {
			products: [],
			suggestions: [],
			facets: {
				categories: [],
				priceRanges: [],
				conditions: [],
				locations: [],
				brands: []
			},
			totalResults: 0,
			searchTime: 0
		};
	}
}

// Export singleton instance
export const smartSearchEngine = new SmartSearchEngine();