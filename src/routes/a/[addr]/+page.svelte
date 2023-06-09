<script lang="ts">
    import type { PageData } from './$types';
    import type { Observable } from 'dexie';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { Tooltip, Avatar } from 'flowbite-svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import ItemOptionsPopover from '$lib/components/ItemsOptionsPopover.svelte';
    import ndk from '$lib/stores/ndk';
    import { currentUser } from '$lib/stores/currentUser';
    import CirclePlusIcon from '$lib/elements/icons/CirclePlus.svelte';
    import ListItemForm from '$lib/components/ListItemForm.svelte';
    import { slide } from 'svelte/transition';
    import { circInOut } from 'svelte/easing';
    import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import type { NDKFilter, NDKTag } from '@nostr-dev-kit/ndk';
    import { browser } from '$app/environment';
    import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@rgossiaux/svelte-headlessui';
    import ListFeed from '$lib/components/ListFeed.svelte';
    import List from '$lib/classes/list';
    import User from '$lib/classes/user';
    import { page } from '$app/stores';
    import ListItemCollection from '$lib/components/ListItemCollection.svelte';

    export let data: PageData;

    let list: Observable<List>;
    let user: Observable<User>;
    const parsedData = JSON.parse(data.data);
    const viewParam = $page.url.searchParams.get('view');

    let addItemFormVisible = false;
    let decryptedPrivateItems = false;
    let toBeAddedPublicListItems: NDKTag[] = [];
    let toBeDeletedPublicListItems: NDKTag[] = [];
    let toBeAddedPrivateListItems: NDKTag[] = [];
    let toBeDeletedPrivateListItems: NDKTag[] = [];
    let publicListItems: NDKTag[] = [];
    let privateListItems: NDKTag[] = [];
    let userIdsForFeed: string[];

    /**
     * Decrypt the content of this list, where secret tags might
     * have been stored.
     */
    async function decryptTags() {
        if (!decryptedPrivateItems && $currentUser?.pubkey === $list.authorPubkey) {
            try {
                const signer = new NDKNip07Signer();
                $ndk.signer = signer;
                const listEvent = new NDKEvent($ndk, JSON.parse($list.event as string));
                const ndkUser = $ndk.getUser({ npub: $currentUser.npub });
                if (listEvent.content.length > 0) {
                    await listEvent.decrypt(ndkUser);
                    const decryptedItems = JSON.parse(listEvent.content);
                    if (decryptedItems && decryptedItems[0]) {
                        privateListItems = decryptedItems;
                    }
                }
                decryptedPrivateItems = true;
            } catch (error) {
                console.error(error);
            }
        }
    }

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
        user = User.get(userOpts.hexpubkey);
        list = List.get(filterForAddrType(data.type));
    }

    function filterForAddrType(type: string): NDKFilter {
        let filter: NDKFilter = {};
        if (type === 'note') {
            filter = { ids: [parsedData] };
        } else if (type === 'naddr') {
            filter = {
                authors: [parsedData.pubkey],
                '#d': [parsedData.identifier],
                kinds: [parsedData.kind]
            };
        }
        return filter;
    }

    if (browser) {
        loadUserAndList();
    }

    function addUnsavedItem(event: any) {
        const itemTag: NDKTag = List.tagFromNip19String(event.detail.addr);

        switch (event.detail.action) {
            case 'add':
                if (event.detail.public === 'public') {
                    toBeAddedPublicListItems.push(itemTag);
                    toBeAddedPublicListItems = toBeAddedPublicListItems;
                } else {
                    toBeAddedPrivateListItems.push(itemTag);
                    toBeAddedPrivateListItems = toBeAddedPrivateListItems;
                }
                break;
            case 'delete':
                if (event.detail.public === 'public') {
                    toBeDeletedPublicListItems.push(itemTag);
                    toBeDeletedPublicListItems = toBeDeletedPublicListItems;
                    publicListItems = publicListItems.filter(
                        (item) => JSON.stringify(item) !== JSON.stringify(itemTag)
                    );
                } else {
                    toBeDeletedPrivateListItems.push(itemTag);
                    toBeDeletedPrivateListItems = toBeDeletedPrivateListItems;
                    privateListItems = privateListItems.filter(
                        (item) => JSON.stringify(item) !== JSON.stringify(itemTag)
                    );
                }

            default:
                break;
        }
    }

    async function publishListEvent() {
        if (browser && $currentUser) {
            const signer = new NDKNip07Signer();
            $ndk.signer = signer;
        }
        if ($list && (uncommittedAdditions || uncommittedDeletions)) {
            // Combine tags from old list and new unsaved changes
            let tagsForList: NDKTag[] = [
                ...toBeAddedPublicListItems,
                ...(publicListItems as NDKTag[])
            ];
            // Only add a "d" tag if needed
            if ($list.kind === 30000 || $list.kind === 30001) {
                tagsForList.push(['d', $list?.name as string]);
            }

            // Handle private items
            toBeAddedPrivateListItems.forEach((privateListItemToAdd) => {
                privateListItems.push(privateListItemToAdd);
            });

            // Build new list event
            let listToPublish = new NDKEvent($ndk, {
                content: JSON.stringify(privateListItems),
                kind: $list?.kind,
                pubkey: $list?.authorPubkey as string,
                created_at: Math.floor(Date.now() / 1000),
                tags: tagsForList
            });

            // Encrypt list event
            let ndkUser = $ndk.getUser({ npub: $currentUser?.npub });
            await listToPublish.encrypt(ndkUser);

            // Sign and publish new list event
            try {
                listToPublish.publish().then(() => {
                    toBeAddedPublicListItems = [];
                    toBeAddedPrivateListItems = [];
                    toBeDeletedPublicListItems = [];
                    toBeDeletedPrivateListItems = [];
                    $list.delete();
                    List.create({ event: listToPublish }).then(() => {
                        loadUserAndList();
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

    // This is a gross hack to get back a real User object, not a duck-typed pseudo-user.
    let realUser: User;
    $: if ($user && !realUser) realUser = new User($user);

    // This is a gross hack to get back a real List object, not a duck-typed pseudo-list.
    let realList: List;
    $: if ($list) realList = new List($list);

    $: publicListItems = $list?.publicItems || [];
    $: {
        if (!decryptedPrivateItems && $list) {
            decryptTags();
        }
    }
    $: {
        if ($list) {
            let privateUserIdsForList: string[] = [];
            if (privateListItems.length > 0) {
                privateUserIdsForList = privateListItems
                    ?.filter((item) => item[0] === 'p')
                    .map((item) => item[1]);
            }
            userIdsForFeed = privateUserIdsForList.concat(realList.publicUserIdsForList());
        }
    }
    let itemCount: number;
    $: itemCount = publicListItems.length + privateListItems.length;
    let uncommittedAdditions: number;
    $: uncommittedAdditions = toBeAddedPublicListItems.length + toBeAddedPrivateListItems.length;
    let uncommittedDeletions: number;
    $: uncommittedDeletions =
        toBeDeletedPublicListItems.length + toBeDeletedPrivateListItems.length;
</script>

<svelte:head>
    {#if realUser}
        <title>Listr: "{$list?.name}" from {realUser.displayableName()}</title>
        <meta
            name="description"
            content={`Listr list page showing the ${
                $list?.name
            } list from ${realUser.displayableName()}`}
        />
    {/if}
</svelte:head>

<div class="listsWrapper flex flex-col gap-6">
    {#if realList}
        {#key realList}
            <div class="listWrapper">
                <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center justify-between">
                    <div class="flex flex-row gap-2 md:gap-4 items-center">
                        <h2 class="text-lg md:text-2xl font-semibold">
                            {realList.name}
                        </h2>
                        <InfoIcon />
                        <Tooltip
                            style="custom"
                            class="flex flex-col gap-1 text-sm dark:bg-zinc-800 bg-zinc-100 border border-black/20 shadow-xl"
                        >
                            <span><span class="font-serif text-lg">κ</span> {realList.kind}</span>
                            <span class="flex md:hidden">
                                {itemCount}
                                {itemCount === 1 ? 'item' : 'items'}
                            </span>
                        </Tooltip>
                        <span class="hidden md:flex text-sm">
                            {itemCount}
                            {itemCount === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                    <div class="flex flex-row gap-4 items-center">
                        {#if $user}
                            <div class="flex flex-row gap-2">
                                <span class="hidden md:flex">Curated by</span>
                                <Avatar
                                    src={realUser.image}
                                    class="object-cover w-6 h-6 border border-white/10"
                                />
                                <a href={`/${realUser.npub}`}>{realUser.displayableName()}</a>
                            </div>
                        {/if}
                        {#if uncommittedAdditions > 0 || uncommittedDeletions > 0}
                            <span class="flex flex-row gap-4">
                                <div class="flex flex-col justify-center">
                                    <span class="text-green-500 dark:text-green-300/50">
                                        {#if uncommittedAdditions > 0}
                                            {uncommittedAdditions}
                                            {uncommittedAdditions === 1 ? 'item' : 'items'} to be added
                                        {/if}
                                    </span>
                                    <span class="text-orange-500 dark:text-orange-300/50">
                                        {#if uncommittedDeletions}
                                            {uncommittedDeletions}
                                            {uncommittedDeletions === 1 ? 'item' : 'items'} to be removed
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
                                    Publish
                                </button>
                            </span>
                        {/if}
                        <ItemOptionsPopover list={realList} klass="mr-0 ml-auto" />
                        <Tooltip
                            style="custom"
                            class="dark:bg-zinc-800 bg-zinc-100  border border-black/20 shadow-xl"
                        >
                            Share this list
                        </Tooltip>
                    </div>
                </div>
                {#if realList.hasPeople(realList.authorPubkey === $currentUser?.pubkey)}
                    <TabGroup defaultIndex={viewParam === 'feed' ? 1 : 0}>
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
                                {#if $currentUser && $user && $currentUser?.pubkey === $user.pubkey}
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
                                    {#if $currentUser && $currentUser?.pubkey === realList.authorPubkey && addItemFormVisible}
                                        <div
                                            transition:slide={{ duration: 400, easing: circInOut }}
                                            class="flex flex-row gap-4 justify-center"
                                        >
                                            <ListItemForm
                                                on:addItemToList={addUnsavedItem}
                                                on:closeForm={toggleForm}
                                                list={realList}
                                            />
                                        </div>
                                    {/if}
                                </div>
                                <ListItemCollection
                                    collection={toBeAddedPrivateListItems}
                                    collectionName="toBeAddedPrivateListItems"
                                    saved={false}
                                    list={realList}
                                    privateItem={true}
                                    action="added"
                                    on:removeItemFromList={addUnsavedItem}
                                />
                                <ListItemCollection
                                    collection={toBeAddedPublicListItems}
                                    collectionName="toBeAddedPublicListItems"
                                    saved={false}
                                    list={realList}
                                    privateItem={false}
                                    action="added"
                                    on:removeItemFromList={addUnsavedItem}
                                />
                                <ListItemCollection
                                    collection={toBeDeletedPrivateListItems}
                                    collectionName="toBeDeletedPrivateListItems"
                                    saved={false}
                                    list={realList}
                                    privateItem={true}
                                    action="deleted"
                                    on:removeItemFromList={addUnsavedItem}
                                />
                                <ListItemCollection
                                    collection={toBeDeletedPublicListItems}
                                    collectionName="toBeDeletedPublicListItems"
                                    saved={false}
                                    list={realList}
                                    privateItem={false}
                                    action="deleted"
                                    on:removeItemFromList={addUnsavedItem}
                                />
                                <ListItemCollection
                                    collection={privateListItems}
                                    collectionName="privateListItems"
                                    saved={true}
                                    list={realList}
                                    privateItem={true}
                                    on:removeItemFromList={addUnsavedItem}
                                />
                                <ListItemCollection
                                    collection={publicListItems}
                                    collectionName="publicListItems"
                                    saved={true}
                                    list={realList}
                                    privateItem={false}
                                    on:removeItemFromList={addUnsavedItem}
                                />
                            </TabPanel>
                            <TabPanel>
                                <ListFeed {userIdsForFeed} list={realList} />
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                {:else}
                    {#if $currentUser && $user && $currentUser?.pubkey === $user.pubkey}
                        <div class="my-4 flex flex-row items-center justify-end gap-2">
                            <button class="flex flex-row gap-2 outlineButton" on:click={toggleForm}>
                                <CirclePlusIcon />
                                <span>Add an item to this list</span>
                            </button>
                        </div>
                    {/if}
                    <div class="mb-2">
                        {#if $currentUser && $currentUser?.pubkey === realList.authorPubkey && addItemFormVisible}
                            <div
                                transition:slide={{ duration: 400, easing: circInOut }}
                                class="flex flex-row gap-4 justify-center"
                            >
                                <ListItemForm
                                    on:addItemToList={addUnsavedItem}
                                    on:closeForm={toggleForm}
                                    list={realList}
                                />
                            </div>
                        {/if}
                    </div>
                    <ListItemCollection
                        collection={toBeAddedPrivateListItems}
                        collectionName="toBeAddedPrivateListItems"
                        saved={false}
                        list={realList}
                        privateItem={true}
                        action="added"
                        on:removeItemFromList={addUnsavedItem}
                    />
                    <ListItemCollection
                        collection={toBeAddedPublicListItems}
                        collectionName="toBeAddedPublicListItems"
                        saved={false}
                        list={realList}
                        privateItem={false}
                        action="added"
                        on:removeItemFromList={addUnsavedItem}
                    />
                    <ListItemCollection
                        collection={toBeDeletedPrivateListItems}
                        collectionName="toBeDeletedPrivateListItems"
                        saved={false}
                        list={realList}
                        privateItem={true}
                        action="deleted"
                        on:removeItemFromList={addUnsavedItem}
                    />
                    <ListItemCollection
                        collection={toBeDeletedPublicListItems}
                        collectionName="toBeDeletedPublicListItems"
                        saved={false}
                        list={realList}
                        privateItem={false}
                        action="deleted"
                        on:removeItemFromList={addUnsavedItem}
                    />
                    <ListItemCollection
                        collection={privateListItems}
                        collectionName="privateListItems"
                        saved={true}
                        list={realList}
                        privateItem={true}
                        on:removeItemFromList={addUnsavedItem}
                    />
                    <ListItemCollection
                        collection={publicListItems}
                        collectionName="publicListItems"
                        saved={true}
                        list={realList}
                        privateItem={false}
                        on:removeItemFromList={addUnsavedItem}
                    />
                {/if}
            </div>
        {/key}
    {:else}
        <h2 class="text-xl animate-pulse">List loading...</h2>
    {/if}
</div>
