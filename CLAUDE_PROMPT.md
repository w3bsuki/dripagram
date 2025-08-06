# 🤖 Claude Code Session Setup Prompt

Copy this entire prompt to start a **new Claude Code session** for Driplo.bg development:

---

## Project Context

I'm building **Driplo.bg** - a Bulgarian second-hand fashion marketplace using SvelteKit + Skeleton UI + Supabase.

**Key files to read first:**

- `PRD.md` - Complete product requirements
- `SETUP.md` - Technical setup instructions
- `TECHSTACK.md` - Architecture details

## Current Status

**What's Done:**

- Project requirements defined in PRD.md
- Complete setup instructions in SETUP.md
- Database schema designed
- Tech stack selected (SvelteKit + Skeleton UI + Supabase)

**What I Need Help With:**
[Describe your current task - e.g., "Implement the homepage", "Set up authentication", "Create product listing form", etc.]

## Development Rules (CRITICAL)

### ✅ MUST DO

1. **Use Skeleton UI only** - Never build custom UI components
2. **Keep it simple** - Maximum 10 total components
3. **Mobile-first design** - Design for phones, enhance for desktop
4. **Bulgarian language** - All user-facing text in Bulgarian
5. **Svelte 5 syntax** - Use `$state()`, `$props()`, `$effect()`
6. **TypeScript strict** - Zero errors tolerance
7. **Performance first** - <2s page loads target

### ❌ NEVER DO

- Build custom UI components (use Skeleton's)
- Create complex folder structures
- Use gradients or fancy animations
- Over-engineer anything
- Ignore mobile experience
- Use English in user interface

## Tech Stack (LOCKED)

```yaml
Frontend: SvelteKit 2 + Svelte 5 + Skeleton UI + Tailwind
Backend: Supabase (Auth + Database + Storage)
Language: TypeScript (strict mode)
Icons: Lucide Svelte
Theme: Skeleton "modern" preset
```

## Project Structure

```
src/
├── lib/
│   ├── components/          # Max 5-10 components
│   │   ├── ProductCard.svelte
│   │   ├── ProductForm.svelte
│   │   ├── SearchBar.svelte
│   │   └── ...
│   ├── stores/             # Global state
│   │   ├── auth.ts
│   │   └── products.ts
│   ├── utils/              # Utilities
│   │   ├── supabase.ts
│   │   └── constants.ts
│   └── types/              # TypeScript types
├── routes/                 # Pages
│   ├── +layout.svelte      # App shell
│   ├── +page.svelte        # Homepage
│   ├── auth/login/
│   ├── sell/
│   └── products/[id]/
```

## Database Schema

See `SETUP.md` for complete schema. Key tables:

- `products` - Product listings
- `profiles` - User profiles (extends Supabase auth)
- `messages` - Buyer/seller messaging
- `favorites` - User favorites

## Key Features to Implement

### Phase 1 (MVP)

- [ ] Homepage with product grid
- [ ] User authentication (Supabase Auth)
- [ ] Create/edit product listings
- [ ] Product detail pages
- [ ] Basic search and filters
- [ ] Responsive design

### Current Task

[Specify what you want to work on - e.g.:]

- Implement homepage with Skeleton UI components
- Set up Supabase authentication flow
- Create product listing form
- Build search functionality

## Success Criteria

- Zero TypeScript errors (`npm run check`)
- Mobile responsive (test on phone)
- <2s page load times
- Bulgarian language throughout
- Uses only Skeleton UI components
- Follows Svelte 5 best practices

## Development Commands

```bash
npm run dev          # Start development
npm run check        # Type checking (must pass!)
npm run build        # Production build
supabase start       # Start local database
```

## Example Component Style

```svelte
<script lang="ts">
	import { Card, Button, InputChip } from '@skeletonlabs/skeleton';
	import { Search } from 'lucide-svelte';

	// Svelte 5 syntax
	let { products } = $props();
	let searchQuery = $state('');

	// Keep it simple!
</script>

<Card class="p-4">
	<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
		<div class="input-group-shim">
			<Search size={16} />
		</div>
		<input bind:value={searchQuery} placeholder="Търси продукти..." class="input" />
		<Button class="variant-filled-primary">Търси</Button>
	</div>
</Card>
```

## Questions to Ask Me

1. What specific feature should we implement first?
2. Do you have Supabase credentials set up?
3. Should we start with the homepage or authentication?
4. Any specific design preferences within Skeleton UI's modern theme?

---

**GOAL: Build a working marketplace quickly using Skeleton UI - no custom components, no over-engineering!**

Start by reading the PRD.md and SETUP.md files, then let me know what you'd like to implement first.
