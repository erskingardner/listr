<script lang="ts">
    import type { PageData } from './$types';
    import type { Observable } from 'dexie';
    import List from '$lib/components/List.svelte';
    import UserProfileHeader from '$lib/components/UserProfileHeader.svelte';

    export let data: PageData;

    let user: Observable<App.User>;
    let lists: Observable<App.List[]>;

    $: lists = data.lists;
    $: user = data.user;
</script>

<svelte:head>
    <title>Listr: {$user?.displayName || $user?.name}</title>
    <meta
        name="description"
        content={`Listr user page showing all lists for ${$user?.displayName || $user?.name}`}
    />
</svelte:head>

<!-- Profile Header -->
<UserProfileHeader {user} />

<!-- Lists -->
<div class="listsWrapper flex flex-col gap-6">
    <!-- Contact List -->

    <!-- Other Lists -->
    {#if $lists && $lists.length > 0}
        {#key $lists}
            {#each $lists as list}
                <List {list} />
            {/each}
        {/key}
    {:else}
        <h2 class="text-xl animate-pulse">Loading lists...</h2>
    {/if}
</div>
