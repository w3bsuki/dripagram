# UI Component Migration Plan
## shadcn-svelte Integration & Svelte 5 Standardization

---

## 📊 Current State Analysis

### ✅ Components Already Using Svelte 5 (No Migration Needed)
Most components are already using Svelte 5 syntax correctly:
- `button.svelte` - Uses $props(), {@render}
- `input.svelte` - Uses $props(), $bindable()
- `CardContent.svelte` - Uses $props(), {@render}
- `Modal.svelte` - Uses $props(), $bindable()
- Most other components

### ⚠️ Components Needing Import Updates
All components using icons need to switch from `lucide-svelte` to `@lucide/svelte`:
- [ ] `Modal.svelte` - Update import { X } from 'lucide-svelte'
- [ ] `MobileBottomNav.svelte` - Update icon imports
- [ ] Any other components with lucide imports

### 🔄 Components to Replace with shadcn-svelte Versions
These should be replaced entirely with official shadcn components:

#### Priority 1 - Core Components
- [ ] **Button** → Use shadcn button (keep our style variants)
- [ ] **Input** → Use shadcn input 
- [ ] **Label** → Add shadcn label
- [ ] **Textarea** → Use shadcn textarea
- [ ] **Select** → Use shadcn select
- [ ] **Switch** → Use shadcn switch
- [ ] **Checkbox** → Add shadcn checkbox (missing)

#### Priority 2 - Layout Components  
- [ ] **Card Suite** → Use shadcn card components
- [ ] **Dialog** → Use shadcn dialog
- [ ] **Sheet** → Use shadcn sheet
- [ ] **AlertDialog** → Use shadcn alert-dialog
- [ ] **Popover** → Use shadcn popover
- [ ] **Tooltip** → Use shadcn tooltip

#### Priority 3 - Data Display
- [ ] **Table Suite** → Use shadcn table
- [ ] **DataTable** → Use shadcn data-table
- [ ] **Badge** → Use shadcn badge
- [ ] **Alert** → Use shadcn alert
- [ ] **Avatar** → Use shadcn avatar
- [ ] **Skeleton** → Use shadcn skeleton

#### Priority 4 - Navigation
- [ ] **Tabs** → Use shadcn tabs
- [ ] **Breadcrumb** → Use shadcn breadcrumb
- [ ] **Pagination** → Use shadcn pagination
- [ ] **DropdownMenu** → Use shadcn dropdown-menu

### 🆕 New Components to Add from shadcn
- [ ] **Form** - Form validation wrapper
- [ ] **Toast/Sonner** - Notification system
- [ ] **Command** - Command palette
- [ ] **Calendar** - Date picker component
- [ ] **Combobox** - Searchable select
- [ ] **Accordion** - Collapsible sections
- [ ] **Progress** - Progress indicators
- [ ] **ScrollArea** - Custom scrollbars
- [ ] **Separator** - Visual dividers
- [ ] **Slider** - Range inputs
- [ ] **Toggle** - Toggle buttons
- [ ] **ToggleGroup** - Toggle button groups

### 🎨 Custom Components to Keep
These are app-specific and should remain:
- `DriploLogo.svelte`
- `BrandBadge.svelte`
- `ProductCard.svelte`
- `ProductGrid.svelte`
- `Header.svelte`
- `Footer.svelte`
- `MobileHeader.svelte`
- `MobileBottomNav.svelte`
- `EnhancedImage.svelte`
- `ColorPicker.svelte`
- `Confetti.svelte`
- `PasswordStrength.svelte`
- `RatingStars.svelte`
- `InfiniteScroll.svelte`
- `ErrorBoundary.svelte`

---

## 🚀 Migration Strategy

### Phase 1: Quick Wins (30 mins)
1. Update all lucide-svelte imports to @lucide/svelte
2. Test shadcn CLI with a simple component
3. Verify build still works

### Phase 2: Core Components (2 hours)
```bash
# Add essential components one by one
pnpm dlx shadcn-svelte@latest add button --overwrite
pnpm dlx shadcn-svelte@latest add input --overwrite
pnpm dlx shadcn-svelte@latest add label
pnpm dlx shadcn-svelte@latest add textarea --overwrite
pnpm dlx shadcn-svelte@latest add checkbox
pnpm dlx shadcn-svelte@latest add switch --overwrite
pnpm dlx shadcn-svelte@latest add select --overwrite
```

### Phase 3: Layout Components (2 hours)
```bash
# Add layout components
pnpm dlx shadcn-svelte@latest add card --overwrite
pnpm dlx shadcn-svelte@latest add dialog --overwrite
pnpm dlx shadcn-svelte@latest add sheet --overwrite
pnpm dlx shadcn-svelte@latest add alert-dialog --overwrite
pnpm dlx shadcn-svelte@latest add popover --overwrite
pnpm dlx shadcn-svelte@latest add tooltip --overwrite
```

### Phase 4: Data Components (1 hour)
```bash
# Add data display components
pnpm dlx shadcn-svelte@latest add table --overwrite
pnpm dlx shadcn-svelte@latest add data-table --overwrite
pnpm dlx shadcn-svelte@latest add badge --overwrite
pnpm dlx shadcn-svelte@latest add alert --overwrite
pnpm dlx shadcn-svelte@latest add avatar --overwrite
pnpm dlx shadcn-svelte@latest add skeleton --overwrite
```

### Phase 5: Navigation Components (1 hour)
```bash
# Add navigation components
pnpm dlx shadcn-svelte@latest add tabs --overwrite
pnpm dlx shadcn-svelte@latest add breadcrumb --overwrite
pnpm dlx shadcn-svelte@latest add pagination --overwrite
pnpm dlx shadcn-svelte@latest add dropdown-menu --overwrite
```

### Phase 6: New Features (2 hours)
```bash
# Add new components that don't exist yet
pnpm dlx shadcn-svelte@latest add form
pnpm dlx shadcn-svelte@latest add sonner
pnpm dlx shadcn-svelte@latest add command
pnpm dlx shadcn-svelte@latest add calendar
pnpm dlx shadcn-svelte@latest add combobox
pnpm dlx shadcn-svelte@latest add accordion
pnpm dlx shadcn-svelte@latest add progress
pnpm dlx shadcn-svelte@latest add scroll-area
pnpm dlx shadcn-svelte@latest add separator
pnpm dlx shadcn-svelte@latest add slider
pnpm dlx shadcn-svelte@latest add toggle
pnpm dlx shadcn-svelte@latest add toggle-group
```

---

## 🔧 Import Path Updates Required

After adding shadcn components, update imports throughout the codebase:

### Old Import Pattern
```typescript
import Button from '$lib/components/ui/button.svelte';
import { Card } from '$lib/components/ui/card';
```

### New Import Pattern
```typescript
import { Button } from '$lib/components/ui/button';
import * as Card from '$lib/components/ui/card';
// or
import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
```

---

## ⚡ Component Usage Patterns

### Button Component
```svelte
<script>
  import { Button } from '$lib/components/ui/button';
</script>

<Button variant="default" size="md">Click me</Button>
```

### Card Component
```svelte
<script>
  import * as Card from '$lib/components/ui/card';
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
</Card.Root>
```

### Form with Input
```svelte
<script>
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  
  let value = $state('');
</script>

<div>
  <Label for="email">Email</Label>
  <Input id="email" type="email" bind:value placeholder="Enter email" />
</div>
```

---

## ✅ Testing Checklist

After each component migration:
- [ ] Component renders correctly
- [ ] All props work as expected  
- [ ] Events fire properly
- [ ] Two-way binding works (if applicable)
- [ ] Dark mode styling works
- [ ] Mobile responsive behavior intact
- [ ] No TypeScript errors
- [ ] No console warnings

---

## 🚨 Common Issues & Solutions

### Issue 1: Import errors after migration
**Solution**: Update all imports to new shadcn pattern

### Issue 2: Style conflicts
**Solution**: Remove old component styles, use shadcn defaults

### Issue 3: Missing props/features
**Solution**: Extend shadcn component or keep custom version

### Issue 4: Type errors
**Solution**: Check shadcn component types, update usage

### Issue 5: Broken layouts
**Solution**: Adjust wrapper elements, check for className vs class

---

## 📝 Post-Migration Cleanup

1. Remove old component files that were replaced
2. Update all import statements project-wide
3. Remove unused dependencies
4. Update documentation
5. Run full test suite
6. Check bundle size impact

---

## 🎯 Success Criteria

- ✅ All components use consistent Svelte 5 syntax
- ✅ shadcn components integrated successfully
- ✅ Zero TypeScript errors
- ✅ Build succeeds without warnings
- ✅ All features still work as before
- ✅ Improved developer experience
- ✅ Consistent component API

---

**Estimated Total Time**: 8-10 hours
**Risk Level**: Medium (existing components work, incremental migration possible)
**Rollback Plan**: Git revert if issues arise

---