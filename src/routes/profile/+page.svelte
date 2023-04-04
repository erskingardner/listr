<script lang="ts">
    import { currentUserProfile } from '$lib/stores/currentUser';
    import UserProfileHero from '$lib/components/UserProfileHero.svelte';
</script>

{#if $currentUserProfile}
    <UserProfileHero userProfile={$currentUserProfile} />
{/if}
