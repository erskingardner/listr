<script lang="ts">
    import type { PageData } from './$types';
    import UserProfileHero from '$lib/components/UserProfileHero.svelte';
    import ReplaceableList from '$lib/components/ReplaceableList.svelte';

    export let data: PageData;
    let user = data.user;
</script>

{#if user}
    <UserProfileHero userHexId={user.hexpubkey()} />
{/if}

<h1 class="text-4xl font-semibold mb-4">Lists</h1>

<ReplaceableList userHexId={user.hexpubkey()} />
