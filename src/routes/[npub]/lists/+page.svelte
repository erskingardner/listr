<script lang="ts">
    import type { PageData } from './$types';
    import UserProfileHero from '$lib/components/UserProfileHero.svelte';

    export let data: PageData;
    let user = data.user;

    $: user;
</script>

{#if user}
    <UserProfileHero {user} />
{/if}
