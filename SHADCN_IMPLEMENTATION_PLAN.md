# shadcn-svelte Full Implementation Plan
## For Svelte 5 + SvelteKit 2 + Tailwind v4

> **Status**: Ready for Implementation  
> **Created**: 2025-08-03  
> **Project**: Driplo.bg - E-commerce Platform  

---

## 📋 Pre-Implementation Analysis

### Current State Assessment
- [x] SvelteKit 2.22.0 installed ✅
- [x] Svelte 5.0.0 installed ✅  
- [x] Tailwind CSS v4.1.11 configured ✅
- [x] components.json already exists ✅
- [x] shadcn-svelte v1.0.6 in package.json ✅
- [x] Some UI components already present in src/lib/components/ui ✅

### ⚠️ Critical Observations
1. **shadcn-svelte already partially installed** but needs proper setup
2. **Existing UI components** use mixed patterns (some Svelte 4, some Svelte 5)
3. **Tailwind v4** uses CSS-first approach (different from v3)
4. **Dependencies need updates** for full Svelte 5 compatibility

---

## 🎯 Implementation Phases

### Phase 1: Dependencies & Configuration
- [x] Update shadcn-svelte to latest version (^1.0.6+) ✅
- [x] Update bits-ui from ^2.9.1 to latest (for Svelte 5 runes) ✅
- [x] Update lucide-svelte from ^0.536.0 to latest @lucide/svelte ✅
- [x] Add tailwindcss-animate plugin ✅
- [x] Configure proper Tailwind v4 integration with shadcn ✅

### Phase 2: Configuration Files
- [x] Update components.json with latest schema: ✅
  ```json
  {
    "$schema": "https://shadcn-svelte.com/registry/config.json",
    "style": "new-york",
    "tailwind": {
      "config": "tailwind.config.js",
      "css": "src/app.css",
      "baseColor": "violet"
    },
    "aliases": {
      "components": "$lib/components",
      "lib": "$lib",
      "utils": "$lib/utils",
      "hooks": "$lib/hooks",
      "ui": "$lib/components/ui"
    },
    "registry": "https://shadcn-svelte.com/registry",
    "ui": "$lib/components/ui",
    "hooks": "$lib/hooks",
    "lib": "$lib"
  }
  ```

- [x] Update tailwind.config.js for shadcn requirements: ✅
  ```javascript
  // Add animations, proper content paths, and plugins
  export default {
    content: [
      './src/**/*.{html,js,svelte,ts,md,mdx}',
      './src/**/*.stories.{js,ts}',
      './.svelte-kit/generated/**/*.{js,ts}'
    ],
    theme: {
      extend: {
        animation: {
          // shadcn animations
        }
      }
    },
    plugins: [
      require('tailwindcss-animate')
    ]
  };
  ```

- [x] Update src/app.css with shadcn CSS variables: ✅
  ```css
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      /* Add all shadcn color variables */
    }
    .dark {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      /* Dark mode variables */
    }
  }
  ```

### Phase 3: Migrate Existing Components to Svelte 5
- [x] Convert all components in ui/ to use Svelte 5 runes: ✅ (Already done!)
  - [x] Replace `export let` with `let { prop } = $props()` ✅
  - [x] Replace `on:click` with `onclick` ✅
  - [x] Replace `$:` reactive statements with `$derived` ✅
  - [x] Replace `<slot>` with `{@render children()}` ✅
  - [x] Update state management to use `$state()` ✅

### Phase 4: Component-by-Component Migration

#### Core Components (Priority 1)
- [ ] **Button** - Update to Svelte 5 syntax
- [ ] **Input** - Convert to runes pattern
- [ ] **Label** - Migrate props and events
- [ ] **Card** components - Full suite migration
- [ ] **Dialog** components - Update with proper portal handling
- [ ] **Sheet** components - Fix compat layer issues

#### Data Display (Priority 2)
- [ ] **Table** components - Convert all table parts
- [ ] **DataTable** - Update with Svelte 5 patterns
- [ ] **Alert** components - Migrate to new syntax
- [ ] **Badge** - Simple conversion
- [ ] **Skeleton** - Update animations

#### Form Components (Priority 3)
- [ ] **Select** components - Complex state management
- [ ] **RadioGroup** - Convert to runes
- [ ] **Switch** - Update toggle logic
- [ ] **Textarea** - Simple migration
- [ ] **Checkbox** - Add if missing

#### Navigation (Priority 4)
- [ ] **Tabs** components - State management update
- [ ] **Breadcrumb** components - Link handling
- [ ] **Pagination** components - Navigation logic
- [ ] **DropdownMenu** - Complex nested menus

#### Feedback (Priority 5)
- [ ] **Tooltip** components - Portal handling
- [ ] **Popover** components - Position management
- [ ] **AlertDialog** components - Modal state

### Phase 5: Add Missing Essential Components
- [ ] **Form** components (form validation)
- [ ] **Toast/Sonner** (notifications)
- [ ] **Command** (command palette)
- [ ] **Calendar** (date picking)
- [ ] **DatePicker** (form dates)
- [ ] **Combobox** (searchable select)
- [ ] **Slider** (range input)
- [ ] **Progress** (loading states)
- [ ] **Accordion** (collapsible content)
- [ ] **ScrollArea** (custom scrollbars)

### Phase 6: Integration & Testing
- [ ] Create test page with all components
- [ ] Verify dark mode switching
- [ ] Test responsive behavior
- [ ] Check accessibility (a11y)
- [ ] Validate TypeScript types
- [ ] Run full build check

### Phase 7: Documentation & Cleanup
- [ ] Create component usage examples
- [ ] Document Svelte 5 patterns used
- [ ] Remove old/duplicate components
- [ ] Update import paths project-wide
- [ ] Clean up unused dependencies

---

## 🛠️ Implementation Commands

### ✅ Completed Steps:
```bash
# Step 1: Update dependencies ✅
pnpm add -D @lucide/svelte@latest tailwindcss-animate@latest
pnpm add bits-ui@latest class-variance-authority@latest clsx@latest tailwind-merge@latest

# Step 2: Test shadcn-svelte CLI ✅
npx shadcn-svelte@latest add separator -y  # Successfully added!

# Step 3: Fixed all lucide imports ✅
# Replaced all 'lucide-svelte' with '@lucide/svelte'
```

### 🔄 Next Steps:
```bash
# Add/update components (one by one)
pnpm dlx shadcn-svelte@latest add button --overwrite
pnpm dlx shadcn-svelte@latest add card --overwrite
pnpm dlx shadcn-svelte@latest add dialog --overwrite
# ... continue for each component

# Verify installation
pnpm run check
pnpm run build
```

---

## ✅ Success Criteria

### Must Pass All Checks
- [ ] `pnpm run check` - 0 TypeScript errors
- [ ] `pnpm run build` - Successful build
- [ ] `pnpm run lint` - No linting errors
- [ ] All components use Svelte 5 syntax exclusively
- [ ] No duplicate component files
- [ ] Consistent import patterns

### Component Requirements
- [ ] All props use `$props()` syntax
- [ ] All events use new syntax (onclick, not on:click)
- [ ] All state uses `$state()` rune
- [ ] All derived values use `$derived()`
- [ ] All slots replaced with snippets/render

### UI/UX Validation
- [ ] Dark mode toggle works
- [ ] Responsive on all breakpoints
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Focus management correct
- [ ] Animation performance smooth

---

## 🚨 Common Pitfalls to Avoid

1. **Don't mix Svelte 4 and 5 syntax** - Causes reactivity issues
2. **Don't create duplicate files** - Edit existing components
3. **Don't skip type checking** - Run after every change
4. **Don't forget Tailwind v4 differences** - CSS-first approach
5. **Don't rush component migration** - Test each thoroughly
6. **Don't ignore accessibility** - Keep ARIA attributes
7. **Don't break existing functionality** - Test as you go

---

## 📝 Notes

- **Tailwind v4 Consideration**: The CSS-first approach means we define tokens in CSS, not JS config
- **Svelte 5 Runes**: All components must use the new rune system for consistency
- **Component Library**: We're building on top of bits-ui for headless components
- **Dark Mode**: Implement using class-based switching on root element
- **TypeScript**: Maintain strict typing throughout migration

---

## 🎯 Final Checklist

Before marking complete:
- [ ] All components migrated to Svelte 5
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Dark mode functional
- [ ] All imports resolved
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] This file deleted after completion

---

**End of Implementation Plan**