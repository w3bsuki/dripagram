# Tech Stack Documentation & Audit System

## Overview
This directory contains comprehensive documentation and audit findings for each technology in our tech stack. Each markdown file represents a deep-dive audit into best practices, dos/don'ts, and implementation guidelines. Additionally, we have REFACTOR files that provide step-by-step migration guides for modernizing our codebase.

## Structure
```
techstack/
├── README.md                    # This file - explains the audit system
├── SVELTE5.md                  # Svelte 5 - Runes, components, reactivity
├── SVELTEKIT2.md               # SvelteKit 2 - Routing, SSR, data loading
├── TAILWINDCSS4.md             # Tailwind CSS v4 - Styling, utilities, config
├── SHADCN.md                   # shadcn-svelte - Components, theming, structure
├── TYPESCRIPT.md               # TypeScript - Types, strict mode, best practices
├── SUPABASE.md                 # Supabase - Auth, database, storage, real-time
│
├── REFACTOR-SVELTE5.md         # Migration guide: Svelte 4 → Svelte 5
├── REFACTOR-SVELTEKIT2.md      # Migration guide: SvelteKit 1 → SvelteKit 2
├── REFACTOR-TAILWINDCSS4.md    # Migration guide: Tailwind v3 → v4
├── REFACTOR-SHADCN.md          # ⚡ ACTIVE: Removing shadcn-svelte bloat
├── REFACTOR-TYPESCRIPT.md      # Migration guide: JS → TypeScript strict
└── REFACTOR-SUPABASE.md        # Migration guide: Local → Supabase backend
```

## Documentation Types

### 📚 Tech Files (SVELTE5.md, etc.)
Each technology file follows this structure:
1. **Technology Overview** - Version, official docs links
2. **Best Practices** - Dos and don'ts from official docs
3. **Project-Specific Guidelines** - How to apply in our Driplo project
4. **Common Pitfalls** - What to avoid
5. **Audit Findings** - Current state analysis
6. **Action Items** - What needs to be fixed/improved

### 🔧 Refactor Files (REFACTOR-*.md)
Each refactor file provides:
1. **Mission Briefing** - Goal, status, priority, time estimate
2. **Conversion Strategy** - Phased approach to migration
3. **Detailed Tasks** - Step-by-step instructions with code templates
4. **Testing Approach** - How to verify each change
5. **Success Metrics** - Before/after comparisons
6. **Agent Instructions** - How AI agents can execute the plan

## Usage
1. **Read this README** to understand the system
2. **Check tech files** for best practices and guidelines
3. **Use refactor files** for migration tasks
4. **Follow the active refactor** (currently REFACTOR-SHADCN.md)
5. **Update files** as we complete migrations

## Tech Stack Quick Reference
- **Svelte 5.37+** → [SVELTE5.md](./SVELTE5.md)
- **SvelteKit 2.27+** → [SVELTEKIT2.md](./SVELTEKIT2.md) 
- **Tailwind CSS v4** → [TAILWINDCSS4.md](./TAILWINDCSS4.md)
- **shadcn-svelte** → [SHADCN.md](./SHADCN.md)
- **TypeScript 5.9+** → [TYPESCRIPT.md](./TYPESCRIPT.md)
- **Supabase** → [SUPABASE.md](./SUPABASE.md)

## 🚨 Current Active Refactor: SHADCN → Native Svelte 5

**Status:** IN PROGRESS  
**File:** [REFACTOR-SHADCN.md](./REFACTOR-SHADCN.md)  
**Goal:** Remove 131 shadcn component files → ~20 native Svelte 5 components  
**Impact:** Fix broken build, reduce bundle by ~50KB, remove 5 dependencies  

### Quick Start for Developers:
```bash
# 1. Read the refactor plan
cat docs/techstack/REFACTOR-SHADCN.md

# 2. Pick a component task (Button, Input, Badge, Card)
# 3. Follow the native Svelte 5 template provided
# 4. Update all imports
# 5. Test and verify
```

## Quality Gates
All audits and refactors ensure:
- ✅ Zero TypeScript errors
- ✅ Modern syntax usage (Svelte 5 runes)
- ✅ Best practices compliance
- ✅ Performance optimization
- ✅ Accessibility standards

---
**Next Step:** Execute REFACTOR-SHADCN.md to fix the broken build and remove bloat.