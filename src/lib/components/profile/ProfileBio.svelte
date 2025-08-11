<script lang="ts">
    let { profile } = $props();
</script>

<div class="text-sm text-foreground">
    {#if profile.full_name && profile.full_name !== profile.username}
        <p class="font-semibold">{profile.full_name}</p>
    {/if}
    {#if profile.bio}
        <p>{profile.bio}</p>
    {/if}
</div>
