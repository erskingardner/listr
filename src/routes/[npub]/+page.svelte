<script lang="ts">
    import type { PageData } from './$types';
    import UserProfileHero from '$lib/components/UserProfileHero.svelte';
    import ReplaceableList from '$lib/components/ReplaceableList.svelte';

    export let data: PageData;
</script>

{#key data}
    <UserProfileHero userHexId={data.userHexPub} />
{/key}
<h1 class="text-4xl font-semibold mb-4">Lists</h1>

{#key data}
    <ReplaceableList userHexId={data.userHexPub} />
{/key}
