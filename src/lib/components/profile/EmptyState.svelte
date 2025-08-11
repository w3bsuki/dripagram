<script lang="ts">
    import { Plus, Package, Heart } from '@lucide/svelte';
    import Button from '$lib/components/ui/button';

    let { activeTab, createListing } = $props();

    const emptyStates = {
        listings: {
            icon: Plus,
            title: 'Share your first listing',
            subtitle: "When you list items, they'll appear on your profile.",
            buttonText: 'Create Listing',
            buttonAction: createListing
        },
        sold: {
            icon: Package,
            title: 'No sold items',
            subtitle: "Items you've sold will appear here."
        },
        liked: {
            icon: Heart,
            title: 'No saved items',
            subtitle: "Items you save will appear here."
        }
    };

    let currentEmptyState = $derived(emptyStates[activeTab]);
</script>

<div class="flex flex-col items-center justify-center text-center py-16">
    <div class="w-16 h-16 border-2 border-foreground rounded-full flex items-center justify-center mb-6">
        <svelte:component this={currentEmptyState.icon} class="w-8 h-8" />
    </div>
    <h3 class="text-2xl font-light mb-2">{currentEmptyState.title}</h3>
    <p class="text-muted-foreground mb-4">{currentEmptyState.subtitle}</p>
    {#if currentEmptyState.buttonText}
        <Button onclick={currentEmptyState.buttonAction}>{currentEmptyState.buttonText}</Button>
    {/if}
</div>
