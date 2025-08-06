# 🚀 Driplo.bg Development Setup Guide

## Prerequisites

- Node.js 18+ installed
- Git installed
- VS Code (recommended)
- Supabase account

## Step 1: Project Creation

```bash
# Create new SvelteKit project
npm create svelte@latest driplo-marketplace
cd driplo-marketplace

# Select these options:
# ✅ Skeleton project
# ✅ TypeScript
# ✅ ESLint
# ✅ Prettier
# ✅ Playwright
# ✅ Vitest

npm install
```

## Step 2: Install Dependencies

```bash
# UI Framework & Styling
npm install @skeletonlabs/skeleton @skeletonlabs/tw-plugin
npm install @tailwindcss/typography @tailwindcss/forms

# Backend & Database
npm install @supabase/supabase-js @supabase/ssr

# Utilities
npm install @lucide/svelte date-fns zod
npm install -D @types/node

# Initialize Skeleton UI
npx @skeletonlabs/skeleton create
```

## Step 3: Configuration Files

### tailwind.config.js

```javascript
import { join } from 'path';
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}'),
	],
	theme: {
		extend: {},
	},
	plugins: [
		skeleton({
			themes: { preset: ['modern'] },
		}),
	],
};
```

### src/app.html

```html
<!DOCTYPE html>
<html lang="bg" class="%sveltekit.theme%">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>Driplo.bg - Втора употреба мода</title>
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover" data-theme="modern">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
```

### vite.config.ts

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 3000,
		host: true,
	},
});
```

### .env.local

```env
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Supabase Setup

### Initialize Supabase

```bash
npm install -g supabase
supabase login
supabase init
supabase start
```

### Database Schema

Create file `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  phone text,
  location text,
  rating decimal(2,1) default 0,
  total_sales integer default 0,
  is_verified boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  title text not null check (char_length(title) >= 3),
  description text check (char_length(description) <= 1000),
  price decimal(10,2) not null check (price > 0),
  images text[] default '{}' check (array_length(images, 1) <= 5),
  category text not null,
  condition text not null check (condition in ('Ново', 'Като ново', 'Много добро', 'Добро', 'Задоволително')),
  size text,
  brand text,
  location text not null,
  is_active boolean default true,
  is_sold boolean default false,
  view_count integer default 0,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Messages table
create table messages (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  receiver_id uuid references auth.users(id) on delete cascade not null,
  content text not null check (char_length(content) <= 500),
  is_read boolean default false,
  created_at timestamp with time zone default now() not null
);

-- Favorites table
create table favorites (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamp with time zone default now() not null,
  primary key (user_id, product_id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table messages enable row level security;
alter table favorites enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- RLS Policies for products
create policy "Products are viewable by everyone" on products
  for select using (is_active = true);

create policy "Users can insert their own products" on products
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own products" on products
  for update using (auth.uid() = user_id);

create policy "Users can delete their own products" on products
  for delete using (auth.uid() = user_id);

-- RLS Policies for messages
create policy "Users can view messages they sent or received" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can insert messages they send" on messages
  for insert with check (auth.uid() = sender_id);

create policy "Users can update messages they received" on messages
  for update using (auth.uid() = receiver_id);

-- RLS Policies for favorites
create policy "Users can view their own favorites" on favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites" on favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" on favorites
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index products_user_id_idx on products(user_id);
create index products_category_idx on products(category);
create index products_location_idx on products(location);
create index products_created_at_idx on products(created_at desc);
create index messages_product_id_idx on messages(product_id);
create index messages_sender_receiver_idx on messages(sender_id, receiver_id);

-- Create updated_at trigger function
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at before update on profiles
  for each row execute procedure handle_updated_at();

create trigger handle_products_updated_at before update on products
  for each row execute procedure handle_updated_at();
```

### Apply Migration

```bash
supabase db reset
supabase db push
```

## Step 5: Project Structure

Create this folder structure:

```
src/
├── lib/
│   ├── components/
│   │   ├── ProductCard.svelte
│   │   ├── ProductForm.svelte
│   │   ├── SearchBar.svelte
│   │   ├── UserProfile.svelte
│   │   └── MessageThread.svelte
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   └── notifications.ts
│   ├── utils/
│   │   ├── supabase.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   └── types/
│       └── database.ts
├── routes/
│   ├── +layout.svelte
│   ├── +layout.ts
│   ├── +page.svelte
│   ├── auth/
│   ├── sell/
│   ├── products/
│   ├── profile/
│   └── messages/
└── app.html
```

## Step 6: Core Files

### src/lib/utils/supabase.ts

```typescript
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					display_name: string | null;
					avatar_url: string | null;
					phone: string | null;
					location: string | null;
					rating: number | null;
					total_sales: number | null;
					is_verified: boolean | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name?: string | null;
					avatar_url?: string | null;
					phone?: string | null;
					location?: string | null;
					rating?: number | null;
					total_sales?: number | null;
					is_verified?: boolean | null;
				};
				Update: {
					display_name?: string | null;
					avatar_url?: string | null;
					phone?: string | null;
					location?: string | null;
					rating?: number | null;
					total_sales?: number | null;
					is_verified?: boolean | null;
				};
			};
			products: {
				Row: {
					id: string;
					title: string;
					description: string | null;
					price: number;
					images: string[];
					category: string;
					condition: string;
					size: string | null;
					brand: string | null;
					location: string;
					is_active: boolean;
					is_sold: boolean;
					view_count: number;
					user_id: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					title: string;
					description?: string | null;
					price: number;
					images?: string[];
					category: string;
					condition: string;
					size?: string | null;
					brand?: string | null;
					location: string;
					user_id: string;
				};
				Update: {
					title?: string;
					description?: string | null;
					price?: number;
					images?: string[];
					category?: string;
					condition?: string;
					size?: string | null;
					brand?: string | null;
					location?: string;
					is_active?: boolean;
					is_sold?: boolean;
				};
			};
		};
	};
};
```

### src/lib/utils/constants.ts

```typescript
export const CATEGORIES = ['Дамски', 'Мъжки', 'Детски', 'Обувки', 'Чанти', 'Аксесоари'] as const;

export const CONDITIONS = ['Ново', 'Като ново', 'Много добро', 'Добро', 'Задоволително'] as const;

export const LOCATIONS = [
	'София',
	'Пловдив',
	'Варна',
	'Бургас',
	'Русе',
	'Стара Загора',
	'Плевен',
	'Сливен',
	'Добрич',
	'Шумен',
] as const;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

## Step 7: Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Database commands
supabase start          # Start local Supabase
supabase stop           # Stop local Supabase
supabase db reset       # Reset database
supabase db push        # Push schema changes
supabase gen types typescript --local > src/lib/types/database.ts  # Generate types
```

## Step 8: VS Code Extensions (Recommended)

Install these extensions:

- Svelte for VS Code
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint
- PostCSS Language Support

## Step 9: Development Workflow

1. **Start services**: `supabase start` then `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **Check types**: `npm run check` (should be 0 errors)
4. **Test locally**: Open http://localhost:3000
5. **Format code**: `npm run format`
6. **Commit changes**: Use conventional commits

## Step 10: Deployment Preparation

### Environment Variables (Production)

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

## Troubleshooting

### Common Issues

**Supabase not starting:**

```bash
supabase stop
supabase start
```

**TypeScript errors:**

```bash
npm run check
# Fix reported errors before continuing
```

**Build fails:**

```bash
npm run build
# Check console for specific errors
```

**Dependencies issues:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Last Updated**: 2025-08-05  
**Next**: See CLAUDE_PROMPT.md for development session setup
