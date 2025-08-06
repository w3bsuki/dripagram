# Sell Components

This directory contains the refactored sell page components, broken down into smaller, manageable pieces using Svelte 5 syntax and Tailwind CSS.

## Components

### `SellForm.svelte`

Main orchestrator component that manages the entire selling workflow with 5 steps:

1. Category selection
2. Image upload
3. Product details
4. Shipping options
5. Listing preview

### `CategorySelector.svelte`

Handles category selection with visual category cards and emoji icons.

### `ProductImageUploader.svelte`

Manages image upload with drag-and-drop functionality, image reordering, and preview.

### `ProductDetailsForm.svelte`

Form for product information including title, description, price, condition, brand, size, color, and material.

### `ShippingOptions.svelte`

Manages shipping preferences, location, and tags input.

### `ListingPreview.svelte`

Shows a preview of how the listing will appear to buyers with all entered information.

### `StepIndicator.svelte`

Visual step indicator showing progress through the sell form.

### `FormNavigation.svelte`

Navigation controls for moving between steps and publishing the listing.

## Types

### `types.ts`

Contains all TypeScript interfaces for component props and form data structures.

## Key Features

- **Svelte 5 Syntax**: Uses `$state`, `$props`, `$derived`, and `onclick` (not `on:click`)
- **Tailwind CSS**: All styling done with utility classes, no custom CSS
- **TypeScript**: Fully typed with proper interfaces
- **Modular**: Each component has a single responsibility
- **Reusable**: Components can be used independently or together
- **Accessible**: Proper ARIA labels and keyboard navigation

## Usage

```svelte
<script>
	import SellForm from '$lib/components/sell/SellForm.svelte';
</script>

<SellForm userId={user.id} />
```

## File Structure

```
src/lib/components/sell/
├── README.md
├── types.ts
├── SellForm.svelte
├── CategorySelector.svelte
├── ProductImageUploader.svelte
├── ProductDetailsForm.svelte
├── ShippingOptions.svelte
├── ListingPreview.svelte
├── StepIndicator.svelte
└── FormNavigation.svelte
```
