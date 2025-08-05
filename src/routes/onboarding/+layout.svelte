<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  
  let { children }: { children?: any } = $props();
  
  onMount(async () => {
    // Check if user is authenticated
    if (!$auth.user) {
      await goto('/auth/login');
      return;
    }
    
    // Check if onboarding is already completed
    if ($auth.user.onboarding_completed) {
      await goto('/');
    }
  });
</script>

<div class="onboarding-layout">
  {@render children?.()}
</div>

<style>
  .onboarding-layout {
    min-height: 100vh;
    background: var(--color-gray-50);
  }
</style>