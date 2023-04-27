<script lang="ts">
    import type { PageData } from './$types';
    import type { Observable } from 'dexie';
    import { Avatar } from 'flowbite-svelte';
    import { Tooltip } from 'flowbite-svelte';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import ReplaceableListInterface from '$lib/interfaces/replaceableLists';
    import UserInterface from '$lib/interfaces/users';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import { pointerForList } from '$lib/utils/helpers';

    export let data: PageData;
    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';

    let user: Observable<App.User>;
    let lists: Observable<App.List[]>;

    function updateUserAndLists() {
        user = UserInterface.get({ hexpubkey: data.userHexPub });
        lists = ReplaceableListInterface.getForUser({ hexpubkey: data.userHexPub });
    }

    updateUserAndLists();

    $: {
        if ($user && data.userHexPub !== $user?.hexpubkey) {
            updateUserAndLists();
        }
    }
</script>

<svelte:head>
    <title>Listr: {$user?.displayName || $user?.name}</title>
    <meta
        name="description"
        content={`Listr user page showing all lists for ${$user?.displayName || $user?.name}`}
    />
</svelte:head>

<!-- Profile Header -->
<div class="profileWrapper relative w-full mb-14">
    {#if $user}
        <div
            class="absolute inset-0 w-full min-h-[286px] h-full bg-center bg-cover z-0 rounded-lg"
            style={`background-image: url(${$user.banner || defaultBannerImage})`}
        />
        <div
            class="z-1 absolute py-6 inset-0 w-full min-h-[286px] h-full
    bg-gradient-to-b from-transparent to-stone-50 dark:to-stone-950"
        />
        <div class="relative profileMetadata flex flex-col gap-4 pt-10 ml-10 max-w-lg">
            <Avatar src={$user.image} class="w-40 h-40 border-stone-100" border />
            <h1 class="text-3xl font-bold">
                {$user.displayName || $user.name}
            </h1>
            {#if $user.nip05}
                <p class="flex flex-row gap-1 text-xl font-medium">
                    {$user.nip05}
                    <VerifiedCheckIcon />
                </p>
            {/if}

            <p class="text-xl font-medium break-words">{$user.about}</p>
        </div>
    {/if}
</div>
<!-- Lists -->
<div class="listsWrapper flex flex-col gap-6">
    {#if $lists && $lists.length > 0}
        {#each $lists as list}
            <div class="listWrapper">
                <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center">
                    <h2
                        class="flex flex-row gap-1 items-center text-lg md:text-2xl break-words font-semibold"
                    >
                        <HashIcon />
                        <a href="/a/{pointerForList(list)}">
                            {list.name}
                        </a>
                    </h2>
                    <InfoIcon />
                    <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                        Kind: {list.kind}
                    </Tooltip>
                    <SharePopover {list} klass="mr-0 ml-auto" />
                </div>
                <div class="flex flex-col gap-2">
                    {#each list.publicItems as listItem}
                        <ListItem item={listItem} saved={true} />
                    {/each}
                </div>
            </div>
        {/each}
    {:else}
        <h2 class="text-xl">Loading lists...</h2>
    {/if}
</div>
