# 👤 User Profiles Implementation Guide

## 🎯 Overview

User profiles are essential for our Instagram-style C2C platform - they build trust, showcase listings, and enable social features.

## 📋 Current Status

- ✅ Profiles table exists with social features (followers, etc.)
- ✅ Auth system with profile creation
- ✅ User types (personal, brand) supported
- ❌ Need to build profile pages and management UI

## 🚀 Implementation Plan

### Phase 1: Profile Pages

#### 1. **Profile Routes Structure**

```typescript
// Route structure:
src / routes / profile / [username] / +page.svelte; // Public profile view
src / routes / profile / [username] / +page.server.ts; // Load profile data
src / routes / profile / edit / +page.svelte; // Edit own profile
src / routes / profile / settings / +page.svelte; // Account settings
```

#### 2. **Profile Data Structure**

```typescript
interface UserProfile {
	// Basic Info
	id: string;
	username: string;
	full_name?: string;
	bio?: string;
	avatar_url?: string;

	// Account Type
	account_type: 'personal' | 'brand';
	brand_name?: string;
	brand_logo_url?: string;
	brand_verified: boolean;

	// Location
	location?: string;
	city?: string;
	country?: string;

	// Social Stats
	follower_count: number;
	following_count: number;
	listing_count: number;

	// Activity
	joined_at: string;
	last_active?: string;

	// Settings
	is_private: boolean;
	show_activity: boolean;
	email_notifications: boolean;
}
```

### Phase 2: Profile Components

#### **Core Components Needed:**

```typescript
// Profile components:
src / lib / components / profile / ProfileHeader.svelte; // Avatar, name, stats
src / lib / components / profile / ProfileTabs.svelte; // Listings, Sold, Liked
src / lib / components / profile / FollowButton.svelte; // Follow/Unfollow
src / lib / components / profile / ProfileStats.svelte; // Followers, listings stats
src / lib / components / profile / ListingGrid.svelte; // User's listings grid
src / lib / components / profile / ProfileEdit.svelte; // Edit profile form
```

#### **Profile Header Layout (Instagram-style):**

```svelte
<!-- ProfileHeader.svelte -->
<div class="profile-header">
	<!-- Avatar and basic info -->
	<div class="profile-info">
		<img src={profile.avatar_url} alt={profile.username} class="avatar" />
		<div class="info">
			<h1>{profile.username}</h1>
			{#if profile.account_type === 'brand'}
				<span class="brand-badge">✓ {profile.brand_name}</span>
			{/if}
			<p class="bio">{profile.bio}</p>
			<p class="location">📍 {profile.location}</p>
		</div>
	</div>

	<!-- Stats row -->
	<div class="stats">
		<div class="stat">
			<span class="count">{profile.listing_count}</span>
			<span class="label">listings</span>
		</div>
		<div class="stat">
			<span class="count">{profile.follower_count}</span>
			<span class="label">followers</span>
		</div>
		<div class="stat">
			<span class="count">{profile.following_count}</span>
			<span class="label">following</span>
		</div>
	</div>

	<!-- Action buttons -->
	<div class="actions">
		{#if isOwnProfile}
			<button class="btn-secondary">Edit Profile</button>
		{:else}
			<FollowButton userId={profile.id} />
			<button class="btn-secondary">Message</button>
		{/if}
	</div>
</div>
```

### Phase 3: Profile Functionality

#### **Follow System Integration:**

```typescript
// src/lib/services/followService.ts
export async function followUser(userId: string): Promise<void> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in');

	const { error } = await supabase.from('user_follows').insert({
		follower_id: user.id,
		following_id: userId,
	});

	if (error) throw error;
}

export async function unfollowUser(userId: string): Promise<void> {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error('Must be logged in');

	const { error } = await supabase
		.from('user_follows')
		.delete()
		.eq('follower_id', user.id)
		.eq('following_id', userId);

	if (error) throw error;
}

export async function getFollowStatus(userId: string): Promise<{
	isFollowing: boolean;
	followerCount: number;
	followingCount: number;
}> {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Check if current user follows this user
	let isFollowing = false;
	if (user) {
		const { data } = await supabase
			.from('user_follows')
			.select('id')
			.eq('follower_id', user.id)
			.eq('following_id', userId)
			.single();
		isFollowing = !!data;
	}

	// Get follower/following counts
	const { data: profile } = await supabase
		.from('profiles')
		.select('follower_count, following_count')
		.eq('id', userId)
		.single();

	return {
		isFollowing,
		followerCount: profile?.follower_count || 0,
		followingCount: profile?.following_count || 0,
	};
}
```

## 🎨 Instagram-Style Design Guidelines

### **Profile Layout:**

```css
/* Mobile-first profile layout */
.profile-header {
	padding: 1rem;
	background: white;
	border-bottom: 1px solid var(--border-light);
}

.profile-info {
	display: flex;
	gap: 1rem;
	margin-bottom: 1rem;
}

.avatar {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	object-fit: cover;
}

.stats {
	display: flex;
	justify-content: space-around;
	padding: 1rem 0;
	border-bottom: 1px solid var(--border-light);
}

.stat {
	text-align: center;
}

.count {
	display: block;
	font-size: 1.25rem;
	font-weight: 600;
	color: var(--text-primary);
}

.label {
	font-size: 0.875rem;
	color: var(--text-secondary);
}
```

### **Profile Tabs (Instagram-style):**

```svelte
<!-- ProfileTabs.svelte -->
<div class="profile-tabs">
	<button
		class="tab {activeTab === 'listings' ? 'active' : ''}"
		onclick={() => (activeTab = 'listings')}
	>
		<Grid size={20} />
		<span>Listings</span>
	</button>

	<button class="tab {activeTab === 'sold' ? 'active' : ''}" onclick={() => (activeTab = 'sold')}>
		<Check size={20} />
		<span>Sold</span>
	</button>

	<button class="tab {activeTab === 'liked' ? 'active' : ''}" onclick={() => (activeTab = 'liked')}>
		<Heart size={20} />
		<span>Liked</span>
	</button>
</div>

<!-- Tab Content -->
<div class="tab-content">
	{#if activeTab === 'listings'}
		<ListingGrid listings={userListings} />
	{:else if activeTab === 'sold'}
		<ListingGrid listings={soldListings} />
	{:else if activeTab === 'liked'}
		<ListingGrid listings={likedListings} />
	{/if}
</div>
```

## 🛠️ Technical Implementation

### 1. **Profile Loading (SSR)**

```typescript
// src/routes/profile/[username]/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { username } = params;

	// Get profile data
	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select(
			`
      *,
      listings!seller_id(
        id, title, price, images, created_at, status
      )
    `
		)
		.eq('username', username)
		.single();

	if (error) {
		throw error(404, 'User not found');
	}

	// Get follow status if user is logged in
	let followStatus = null;
	if (locals.user) {
		followStatus = await getFollowStatus(profile.id);
	}

	return {
		profile,
		followStatus,
		listings: profile.listings?.filter((l) => l.status === 'active') || [],
	};
};
```

### 2. **Profile Edit Form**

```svelte
<!-- ProfileEdit.svelte -->
<script lang="ts">
	import { auth } from '$lib/stores/auth';

	let profile = $state({
		username: $auth.user?.username || '',
		full_name: $auth.user?.full_name || '',
		bio: '',
		location: '',
		avatar_url: $auth.user?.avatar_url || '',
	});

	async function updateProfile() {
		try {
			await auth.updateProfile(profile);
			// Success message
		} catch (error) {
			// Error handling
		}
	}
</script>

<form onsubmit={updateProfile}>
	<div class="form-group">
		<label for="username">Username</label>
		<input id="username" bind:value={profile.username} placeholder="your_username" required />
	</div>

	<div class="form-group">
		<label for="full_name">Full Name</label>
		<input id="full_name" bind:value={profile.full_name} placeholder="Your Full Name" />
	</div>

	<div class="form-group">
		<label for="bio">Bio</label>
		<textarea
			id="bio"
			bind:value={profile.bio}
			placeholder="Tell people about yourself..."
			maxlength="150"
		></textarea>
	</div>

	<button type="submit" class="btn-primary">Save Changes</button>
</form>
```

## 📱 Mobile-First Features

### **Profile Actions:**

- Quick follow/unfollow with optimistic updates
- Direct message button integration
- Share profile functionality
- Report user option

### **Social Features:**

- Followers/Following lists with search
- Activity feed (recent likes, follows)
- Collections and saved items
- Review and rating system

## 🔄 Implementation Priority

### **Phase 1 (Critical):**

1. Basic profile page display
2. Edit profile functionality
3. Follow/unfollow system
4. Profile listings grid

### **Phase 2 (Important):**

1. Followers/Following lists
2. Profile statistics
3. Activity feed
4. Collections

### **Phase 3 (Enhancement):**

1. Profile verification system
2. Advanced privacy settings
3. Profile analytics for brands
4. Enhanced social features

## 🎯 Success Metrics

- **Profile Completion Rate** - % of users with complete profiles
- **Follow Engagement** - Average follows per user
- **Profile Views** - Views on profile pages
- **Conversion Rate** - Profile views → message/follow actions

---

**💡 Next Step**: Implement basic profile pages first, then add social features incrementally based on user feedback.
