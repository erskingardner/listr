<script lang="ts">
    import type { PageData } from './$types';
    import type { Observable } from 'dexie';
    import type { GetListOpts } from '$lib/interfaces/replaceableLists';
    import ReplaceableListInterface from '$lib/interfaces/replaceableLists';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { Tooltip } from 'flowbite-svelte';
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

    export let data: PageData;

    let list: Observable<App.List | undefined>;
    let user: Observable<App.User>;
    const parsedData = JSON.parse(data.data);

    if (browser) {
        const signer = new NDKNip07Signer();
        $ndk.signer = signer;
    }

    let addItemFormVisible = false;
    let unsavedListItems: NDKTag[] = [];
    let publicListItems: NDKTag[] = [];

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
        list = ReplaceableListInterface.getCachedList(optsForAddrType(data.type));
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

    loadUserAndList();

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
            unsavedListItems.push(itemTag);
            unsavedListItems = unsavedListItems;
        }
    }

    function publishListEvent() {
        if ($list && unsavedListItems.length) {
            // Combine tags from old list and new unsaved changes
            let tagsForList: NDKTag[] = [...unsavedListItems, ...($list.publicItems as NDKTag[])];
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
                    unsavedListItems = [];
                    ReplaceableListInterface.delete({ listId: $list?.listId as string });
                    ReplaceableListInterface.create({ event: listToPublish }).then(() => {
                        loadUserAndList();
                        setTimeout(() => loadUserAndList(), 1000);
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
        <div class="listWrapper">
            <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center justify-between">
                <div class="flex flex-row gap-2 md:gap-4 items-center">
                    <h2 class="flex flex-row gap-1 items-center text-lg md:text-2xl font-semibold">
                        <HashIcon />
                        {$list.name}
                    </h2>
                    <InfoIcon />
                    <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                        Kind: {$list.kind}
                    </Tooltip>
                </div>
                <div class="flex flex-row gap-4 items-center">
                    {#if unsavedListItems.length}
                        <span class="text-orange-500 dark:text-orange-300/60">
                            {unsavedListItems.length}
                            {unsavedListItems.length === 1 ? 'change' : 'changes'} to be published
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
                    {#if $currentUser && $currentUser?.hexpubkey === $user.hexpubkey}
                        <button class="" on:click={toggleForm}>
                            <CirclePlusIcon />
                            <Tooltip
                                style="custom"
                                class="dark:bg-stone-800 bg-stone-100 shadow-sm"
                            >
                                Add an item to this list
                            </Tooltip>
                        </button>
                    {/if}
                    <SharePopover list={$list} klass="mr-0 ml-auto" />
                    <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                        Share this list
                    </Tooltip>
                </div>
            </div>
            <div class="mb-2">
                {#if $currentUser?.hexpubkey === $list.authorHexPubkey && addItemFormVisible}
                    <div
                        transition:slide={{ duration: 400, easing: circInOut }}
                        class="flex flex-row gap-4 border border-stone-800/20 dark:border-stone-100/20 rounded-md p-4 justify-center"
                    >
                        <ListItemForm
                            on:addItemToList={addUnsavedItem}
                            on:closeForm={toggleForm}
                            list={$list}
                        />
                    </div>
                {/if}
            </div>
            <div id="unsavedListItems" class="flex flex-col gap-2 mb-2">
                {#each unsavedListItems as listItem}
                    <ListItem item={listItem} saved={false} />
                {/each}
            </div>
            <div class="flex flex-col gap-2">
                {#each publicListItems as listItem}
                    <ListItem item={listItem} saved={true} />
                {/each}
            </div>
        </div>
    {:else}
        <h2 class="text-xl">List loading...</h2>
    {/if}
</div>
