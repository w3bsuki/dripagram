# 🛍️ Product Listing Implementation Guide

## 🎯 Overview

The product listing feature is **CRITICAL** - it's the core functionality that allows users to sell items on our Instagram-style C2C platform.

## 📋 Current Status

- ✅ Database schema exists (`listings` table with social features)
- ✅ Supabase auth and profiles system ready
- ✅ Image storage infrastructure available
- ❌ Need to build the actual listing creation UI/UX

## 🚀 Implementation Plan

### Phase 1: Basic Listing Creation (MVP)

#### 1. **Create Listing Form** (`/sell` page)

```typescript
// Components needed:
src / routes / sell / +page.svelte; // Main listing creation page
src / lib / components / sell / ListingForm.svelte; // Form component
src / lib / components / sell / ImageUploader.svelte; // Image upload component
src / lib / components / sell / CategorySelector.svelte; // Category selection
src / lib / components / sell / ConditionSelector.svelte; // Condition selection
```

#### Required Form Fields:

```typescript
interface ListingData {
	// Basic Info
	title: string; // "Vintage Denim Jacket"
	description: string; // Detailed description
	price: number; // Price in BGN
	category: string; // "Women's Clothing"

	// Product Details
	brand?: string; // "Levi's"
	size?: string; // "M", "38", etc.
	condition: 'new' | 'like-new' | 'excellent' | 'good' | 'fair';
	color?: string; // "Blue"
	material?: string; // "100% Cotton"

	// Images
	images: string[]; // Supabase Storage URLs

	// Location & Shipping
	location: string; // "Sofia, Bulgaria"
	shipping_included: boolean; // Free shipping?
	shipping_price?: number; // If not included

	// Instagram-style features
	hashtags?: string[]; // ["#vintage", "#denim"]
	style_tags?: string[]; // ["casual", "retro"]
}
```

### Phase 2: Image Upload System

#### **Image Upload Requirements:**

```typescript
// Features needed:
1. Drag & drop interface
2. Multiple image upload (max 10 images)
3. Image preview with reorder capability
4. Auto-resize to standard dimensions (800x800, 400x400, 200x200)
5. WebP conversion for performance
6. Upload progress indicators
7. Image cropping/editing tools
```

#### **Supabase Storage Setup:**

```sql
-- Storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- RLS policies for image upload
CREATE POLICY "Users can upload listing images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listing-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view listing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-images');
```

### Phase 3: Listing Management

#### **User Dashboard Features:**

```typescript
// Dashboard components:
src / routes / dashboard / +page.svelte; // Main dashboard
src / lib / components / dashboard / ListingGrid.svelte; // User's listings
src / lib / components / dashboard / ListingStats.svelte; // Views, likes, etc.
src / lib / components / dashboard / QuickActions.svelte; // Edit, delete, promote
```

#### **Listing States:**

```typescript
type ListingStatus =
	| 'draft' // Not published yet
	| 'active' // Live and visible
	| 'sold' // Marked as sold
	| 'paused' // Temporarily hidden
	| 'deleted'; // Soft deleted
```

## 🛠️ Technical Implementation

### 1. **Image Upload Service**

```typescript
// src/lib/services/imageService.ts
export async function uploadListingImages(files: File[], userId: string): Promise<string[]> {
	const uploadPromises = files.map(async (file, index) => {
		// Resize image
		const resized = await resizeImage(file, 800, 800);

		// Generate unique filename
		const filename = `${userId}/${Date.now()}-${index}.webp`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage.from('listing-images').upload(filename, resized);

		if (error) throw error;

		// Return public URL
		return supabase.storage.from('listing-images').getPublicUrl(filename).data.publicUrl;
	});

	return Promise.all(uploadPromises);
}
```

### 2. **Listing Service**

```typescript
// src/lib/services/listingService.ts
export async function createListing(listingData: ListingData): Promise<{ id: string }> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in');

	const { data, error } = await supabase
		.from('listings')
		.insert({
			...listingData,
			seller_id: user.id,
			status: 'active',
			view_count: 0,
			like_count: 0,
		})
		.select('id')
		.single();

	if (error) throw error;
	return data;
}
```

### 3. **Category & Condition Data**

```typescript
// src/lib/data/categories.ts
export const CATEGORIES = [
	{ id: 'women-clothing', name: "Women's Clothing", emoji: '👗' },
	{ id: 'men-clothing', name: "Men's Clothing", emoji: '👔' },
	{ id: 'shoes', name: 'Shoes', emoji: '👟' },
	{ id: 'accessories', name: 'Accessories', emoji: '👜' },
	{ id: 'electronics', name: 'Electronics', emoji: '📱' },
];

export const CONDITIONS = [
	{ id: 'new', name: 'New with Tags', desc: 'Brand new, never worn' },
	{ id: 'like-new', name: 'Like New', desc: 'Excellent condition, worn once or twice' },
	{ id: 'excellent', name: 'Excellent', desc: 'Minor signs of wear' },
	{ id: 'good', name: 'Good', desc: 'Some wear but still great' },
	{ id: 'fair', name: 'Fair', desc: 'Noticeable wear, priced accordingly' },
];
```

## 🎨 UI/UX Guidelines

### **Instagram-Style Design:**

- Clean, minimal forms with lots of white space
- Step-by-step wizard for complex forms
- Inline validation with helpful error messages
- Mobile-first responsive design
- Instagram-style image grid previews

### **User Flow:**

1. **Landing** → "Sell" button in navigation
2. **Category Selection** → Quick category picker with emojis
3. **Image Upload** → Drag & drop with instant previews
4. **Product Details** → Smart form with conditional fields
5. **Preview** → Instagram-style preview of listing
6. **Publish** → Success with share options

## 📱 Mobile Considerations

- Touch-friendly image upload
- Camera integration for quick photos
- Simplified forms for mobile input
- Swipe gestures for image reordering
- Location services integration

## 🚦 Success Metrics

- **Time to List** - Average time from start to published listing
- **Completion Rate** - % of users who complete listing flow
- **Image Quality** - Average number of images per listing
- **Listing Engagement** - Views and likes on new listings

## 🔄 Next Steps

1. Create basic `/sell` page with form
2. Implement image upload component
3. Add category and condition selectors
4. Build listing preview functionality
5. Add draft saving capability
6. Create listing management dashboard

---

**💡 Pro Tip**: Start with a simple MVP version and iterate based on user feedback. The key is getting users listing products quickly and easily!
