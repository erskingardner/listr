<script lang="ts">
    import type { PageData } from './$types';
    import type { Observable } from 'dexie';
    import type { GetListOpts } from '$lib/interfaces/lists';
    import ListInterface from '$lib/interfaces/lists';
    import { hasPeople } from '$lib/interfaces/lists';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { Tooltip, Avatar } from 'flowbite-svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import UserInterface from '$lib/interfaces/users';
    import ndk from '$lib/stores/ndk';
    import { currentUser } from '$lib/stores/currentUser';
    import CirclePlusIcon from '$lib/elements/icons/CirclePlus.svelte';
    import ListItemForm from '$lib/components/ListItemForm.svelte';
    import { slide } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { nip19 } from 'nostr-tools';
    import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import type { NDKTag } from '@nostr-dev-kit/ndk/lib/src/events';
    import type { EventPointer, ProfilePointer } from 'nostr-tools/lib/nip19';
    import { browser } from '$app/environment';
    import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@rgossiaux/svelte-headlessui';
    import ListFeed from '$lib/components/ListFeed.svelte';

    export let data: PageData;

    let list: Observable<App.List | undefined>;
    let user: Observable<App.User>;
    const parsedData = JSON.parse(data.data);

    if (browser) {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
    }

    let addItemFormVisible = false;
    let toBeAddedListItems: NDKTag[] = [];
    let toBeDeletedListItems: NDKTag[] = [];
    let publicListItems: NDKTag[] = [];
    let displayItems: NDKTag[];

    async function loadUserAndList() {
        let userOpts;
        if (parsedData.pubkey) {
            userOpts = { hexpubkey: parsedData.pubkey };
        } else {
            const event = await $ndk.fetchEvent({ ids: [parsedData] }).catch((e) => {
                console.error(e);
            });
            userOpts = { hexpubkey: (event as NDKEvent).pubkey };
        }
        user = UserInterface.get(userOpts);
        list = ListInterface.get(optsForAddrType(data.type));
    }

    function optsForAddrType(type: string): GetListOpts {
        let opts: GetListOpts = {};
        if (type === 'note') {
            opts = { listId: parsedData };
        } else if (type === 'naddr') {
            opts = {
                authorHexPubkey: parsedData.pubkey,
                name: parsedData.identifier,
                kind: parsedData.kind
            };
        }
        return opts;
    }

    if (browser) {
        loadUserAndList();
    }

    function addUnsavedItem(event: any) {
        const decodedEvent = nip19.decode(event.detail.addr);
        let itemTag: NDKTag = [];
        switch (decodedEvent.type) {
            case 'npub':
                itemTag = ['p', decodedEvent.data as string];
                break;
            case 'nprofile':
                itemTag = ['p', (decodedEvent.data as ProfilePointer).pubkey as string];
                break;
            case 'nevent':
                itemTag = ['e', (decodedEvent.data as EventPointer).id as string];
                break;
            case 'note':
                itemTag = ['e', decodedEvent.data as string];
                break;
            case 'naddr':
                itemTag = ['e', (decodedEvent.data as EventPointer).id as string];
                break;
            default:
                break;
        }
        if (itemTag.length === 2) {
            if (event.detail.action === 'add') {
                toBeAddedListItems.push(itemTag);
                toBeAddedListItems = toBeAddedListItems;
            } else if (event.detail.action === 'delete') {
                toBeDeletedListItems.push(itemTag);
                toBeDeletedListItems = toBeDeletedListItems;
                const currentList = displayItems || publicListItems;
                // Convert array items to string... because, Javascript
                const publicStrings = currentList.map((item) => JSON.stringify(item));
                const indexOfItemToDelete = publicStrings.indexOf(JSON.stringify(itemTag));
                currentList.splice(indexOfItemToDelete, 1);
                displayItems = currentList;
            }
        }
    }

    function publishListEvent() {
        if ($list && (toBeAddedListItems.length || toBeDeletedListItems.length)) {
            // Combine tags from old list and new unsaved changes
            const currentList = displayItems || publicListItems;
            let tagsForList: NDKTag[] = [...toBeAddedListItems, ...(currentList as NDKTag[])];
            // Only add a "d" tag if needed
            if ($list.kind === 30000 || $list.kind === 30001) {
                tagsForList.push(['d', $list?.name as string]);
            }

            // Build new list event
            let listToPublish = new NDKEvent($ndk, {
                content: $list?.content as string,
                kind: $list?.kind,
                pubkey: $list?.authorHexPubkey as string,
                created_at: Math.floor(Date.now() / 1000),
                tags: tagsForList
            });

            // Sign and publish new list event
            try {
                listToPublish.publish().then(() => {
                    toBeAddedListItems = [];
                    toBeDeletedListItems = [];
                    displayItems = tagsForList.filter((tag) => tag[0] !== 'd');
                    ListInterface.delete({ listId: $list?.listId as string });
                    ListInterface.create({ event: listToPublish }).then(() => {
                        loadUserAndList();
                        // setTimeout(() => loadUserAndList(), 1000);
                    });
                });
            } catch (error) {
                console.log('Error publishing: ', error);
            }
        }
    }

    function toggleForm() {
        addItemFormVisible = !addItemFormVisible;
    }

    $: publicListItems = $list?.publicItems || [];
</script>

<svelte:head>
    <title>Listr: "{$list?.name}" from {$user?.displayName || $user?.name}</title>
    <meta
        name="description"
        content={`Listr list page showing the ${$list?.name} list from ${
            $user?.displayName || $user?.name
        }`}
    />
</svelte:head>

<div class="listsWrapper flex flex-col gap-6">
    {#if $list}
        {#key $list}
            <div class="listWrapper">
                <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center justify-between">
                    <div class="flex flex-row gap-2 md:gap-4 items-center">
                        <h2
                            class="flex flex-row gap-1 items-center text-lg md:text-2xl font-semibold"
                        >
                            <HashIcon />
                            {$list.name}
                        </h2>
                        <InfoIcon />
                        <Tooltip style="custom" class="dark:bg-zinc-800 bg-zinc-100 shadow-sm">
                            Kind: {$list.kind}
                        </Tooltip>
                    </div>
                    <div class="flex flex-row gap-4 items-center">
                        {#if $user}
                            <div class="flex flex-row gap-2">
                                <span class="hidden md:flex">Curated by</span>
                                <Avatar
                                    src={$user.image}
                                    class="object-cover w-6 h-6 border border-white/10"
                                />
                                <a href={`/${$user.npub}`}>{$user.displayName || $user.name}</a>
                            </div>
                        {/if}
                        {#if toBeAddedListItems.length || toBeDeletedListItems.length}
                            <span class="flex flex-row gap-4">
                                <div class="flex flex-col justify-center">
                                    <span class="text-green-500 dark:text-green-300/50">
                                        {#if toBeAddedListItems.length}
                                            {toBeAddedListItems.length}
                                            {toBeAddedListItems.length === 1 ? 'item' : 'items'} to be
                                            added
                                        {/if}
                                    </span>
                                    <span class="text-orange-500 dark:text-orange-300/50">
                                        {#if toBeDeletedListItems.length}
                                            {toBeDeletedListItems.length}
                                            {toBeDeletedListItems.length === 1 ? 'item' : 'items'} to
                                            be removed
                                        {/if}
                                    </span>
                                </div>
                                <button
                                    class="px-2 py-1 rounded-md bg-transparent border
                            border-orange-500 dark:border-orange-300/80
                            text-orange-500 dark:text-orange-300/80 ml-2
                            hover:bg-orange-500/20 dark:hover:bg-orange-300/20"
                                    on:click={publishListEvent}
                                >
                                    Publish Now
                                </button>
                            </span>
                        {/if}
                        <SharePopover list={$list} klass="mr-0 ml-auto" />
                        <Tooltip style="custom" class="dark:bg-zinc-800 bg-zinc-100 shadow-sm">
                            Share this list
                        </Tooltip>
                    </div>
                </div>
                {#if hasPeople($list)}
                    <TabGroup>
                        <TabList
                            class="flex flex-row gap-1 w-full justify-around bg-zinc-200/40 dark:bg-zinc-900 p-1 rounded-md"
                        >
                            <Tab
                                class={({ selected }) =>
                                    selected ? 'tab-selected' : 'tab-unselected'}>List Items</Tab
                            >
                            <Tab
                                class={({ selected }) =>
                                    selected ? 'tab-selected' : 'tab-unselected'}>List Feed</Tab
                            >
                        </TabList>
                        <TabPanels class="bg-zinc-200/40 dark:bg-zinc-900 p-2 mt-2 rounded-md">
                            <TabPanel>
                                {#if $currentUser && $user && $currentUser?.hexpubkey === $user.hexpubkey}
                                    <div class="my-4 flex flex-row items-center justify-end gap-2">
                                        <button
                                            class="flex flex-row gap-2 outlineButton"
                                            on:click={toggleForm}
                                        >
                                            <CirclePlusIcon />
                                            <span>Add an item to this list</span>
                                        </button>
                                    </div>
                                {/if}
                                <div class="mb-2">
                                    {#if $currentUser && $currentUser?.hexpubkey === $list.authorHexPubkey && addItemFormVisible}
                                        <div
                                            transition:slide={{ duration: 400, easing: circInOut }}
                                            class="flex flex-row gap-4 justify-center"
                                        >
                                            <ListItemForm
                                                on:addItemToList={addUnsavedItem}
                                                on:closeForm={toggleForm}
                                                list={$list}
                                            />
                                        </div>
                                    {/if}
                                </div>
                                <div id="toBeAddedListItems" class="flex flex-col gap-2 mb-2">
                                    {#each toBeAddedListItems as listItem}
                                        <ListItem
                                            item={listItem}
                                            saved={false}
                                            list={$list}
                                            action="added"
                                        />
                                    {/each}
                                </div>
                                <div id="toBeDeletedListItems" class="flex flex-col gap-2 mb-2">
                                    {#each toBeDeletedListItems as listItem}
                                        <ListItem
                                            item={listItem}
                                            saved={false}
                                            list={$list}
                                            action="deleted"
                                        />
                                    {/each}
                                </div>
                                <div class="flex flex-col gap-2">
                                    {#if displayItems}
                                        {#key displayItems}
                                            {#each displayItems as listItem}
                                                <ListItem
                                                    item={listItem}
                                                    saved={true}
                                                    list={$list}
                                                    on:removeItemFromList={addUnsavedItem}
                                                />
                                            {/each}
                                        {/key}
                                    {:else}
                                        {#each publicListItems as listItem}
                                            <ListItem
                                                item={listItem}
                                                saved={true}
                                                list={$list}
                                                on:removeItemFromList={addUnsavedItem}
                                            />
                                        {/each}
                                    {/if}
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <ListFeed list={$list} />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                {:else}
                    {#if $currentUser && $user && $currentUser?.hexpubkey === $user.hexpubkey}
                        <div class="my-4 flex flex-row items-center justify-end gap-2">
                            <button class="flex flex-row gap-2 outlineButton" on:click={toggleForm}>
                                <CirclePlusIcon />
                                <span>Add an item to this list</span>
                            </button>
                        </div>
                    {/if}
                    <div class="mb-2">
                        {#if $currentUser && $currentUser?.hexpubkey === $list.authorHexPubkey && addItemFormVisible}
                            <div
                                transition:slide={{ duration: 400, easing: circInOut }}
                                class="flex flex-row gap-4 justify-center"
                            >
                                <ListItemForm
                                    on:addItemToList={addUnsavedItem}
                                    on:closeForm={toggleForm}
                                    list={$list}
                                />
                            </div>
                        {/if}
                    </div>
                    <div id="toBeAddedListItems" class="flex flex-col gap-2 mb-2">
                        {#each toBeAddedListItems as listItem}
                            <ListItem item={listItem} saved={false} list={$list} action="added" />
                        {/each}
                    </div>
                    <div id="toBeDeletedListItems" class="flex flex-col gap-2 mb-2">
                        {#each toBeDeletedListItems as listItem}
                            <ListItem item={listItem} saved={false} list={$list} action="deleted" />
                        {/each}
                    </div>
                    <div class="flex flex-col gap-2">
                        {#if displayItems}
                            {#key displayItems}
                                {#each displayItems as listItem}
                                    <ListItem
                                        item={listItem}
                                        saved={true}
                                        list={$list}
                                        on:removeItemFromList={addUnsavedItem}
                                    />
                                {/each}
                            {/key}
                        {:else}
                            {#each publicListItems as listItem}
                                <ListItem
                                    item={listItem}
                                    saved={true}
                                    list={$list}
                                    on:removeItemFromList={addUnsavedItem}
                                />
                            {/each}
                        {/if}
                    </div>
                {/if}
            </div>
        {/key}
    {:else}
        <h2 class="text-xl animate-pulse">List loading...</h2>
    {/if}
</div>
