<script lang="ts">
    import type { Observable } from 'dexie';
    import ListComponent from '$lib/components/List.svelte';
    import UserProfileHeader from '$lib/components/UserProfileHeader.svelte';
    import User from '$lib/classes/user';
    import List from '$lib/classes/list';

    export let data;

    let user: Observable<User>;
    let lists: Observable<List[]>;

    $: user = User.get(data.pubkey);
    $: lists = List.forUser(data.pubkey);

    // This is a gross hack to get back a real User object, not a duck-typed pseudo-user.
    let realUser: User;
    $: if ($user) realUser = new User($user);

    // This is a gross hack to get back a real List object, not a duck-typed pseudo-list.
    let realLists: List[];
    $: if ($lists) realLists = $lists.map((list) => new List(list));
</script>

<svelte:head>
    {#if realUser}
        <title>Listr: {realUser.displayableName()}</title>
        <meta
            name="description"
            content={`Listr user page showing all lists for ${realUser.displayableName()}`}
        />
    {:else}
        <title>Listr</title>
        <meta name="description" content="Listr user page showing all lists" />
    {/if}
</svelte:head>

{#key data.pubkey}
    <!-- Profile Header -->
    {#if realUser}
        <UserProfileHeader user={realUser} />
    {/if}

    <!-- Lists -->
    <div class="listsWrapper flex flex-col gap-6">
        {#if realLists && realLists.length > 0}
            {#each realLists as list}
                <ListComponent {list} />
            {/each}
        {:else}
            <h2 class="text-xl animate-pulse">Loading lists...</h2>
        {/if}
    </div>
{/key}
