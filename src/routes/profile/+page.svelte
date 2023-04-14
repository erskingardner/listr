<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import UserProfileHero from '$lib/components/UserProfileHero.svelte';
</script>

{#if $currentUser}
    <UserProfileHero userHexId={$currentUser.hexpubkey} />
{/if}
