<script lang="ts">
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import ChevronIcon from '$lib/elements/icons/Chevron.svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import { Tooltip } from 'flowbite-svelte';
    import type List from '$lib/classes/list';
    import ZapPopover from './ZapPopover.svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import ndk from '$lib/stores/ndk';
    import { NDKEvent, NDKNip07Signer } from '@nostr-dev-kit/ndk';
    import type { NDKFilter, NDKTag } from '@nostr-dev-kit/ndk';
    import ItemsOptionsPopover from '$lib/components/ItemsOptionsPopover.svelte';
    import { unixTimeNow } from '$lib/utils/helpers';
    import HeartIcon from '$lib/elements/icons/Heart.svelte';

    export let list: List;

    let liked: boolean = false;
    let privateItems: NDKTag[] = [];

    /**
     * Decrypt the content of this list, where secret tags might
     * have been stored.
     */
    async function decryptTags() {
        if ($currentUser?.pubkey === list.authorPubkey) {
            try {
                const signer = new NDKNip07Signer();
                $ndk.signer = signer;
                const listEvent = new NDKEvent($ndk, JSON.parse(list.event as string));
                const ndkUser = $ndk.getUser({ npub: $currentUser.npub });
                if (listEvent.content.length > 0) {
                    await listEvent.decrypt(ndkUser);
                    const decryptedItems = JSON.parse(listEvent.content);
                    if (decryptedItems && decryptedItems[0]) {
                        privateItems = decryptedItems;
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    function checkForLikes() {
        if ($currentUser) {
            const likeFilter: NDKFilter = {
                kinds: [7],
                authors: [$currentUser.pubkey as string],
                '#a': [list.id as string]
            };
            $ndk.fetchEvent(likeFilter).then((likeEvent) => {
                if (likeEvent) {
                    liked = true;
                }
            });
        }
    }

    decryptTags();
    checkForLikes();

    function handleDeleteList(event: any) {
        // Create & publish list deletion event (kind 5)
        const deleteEvent = new NDKEvent($ndk, {
            kind: 5,
            pubkey: list.authorPubkey,
            content: 'List deleted by owner',
            tags: [['a', list.id as string]],
            created_at: unixTimeNow()
        });
        deleteEvent
            .publish()
            .then(() => {
                // Delete the list from the cache
                list.delete();
            })
            .catch((error) => {
                console.error(error);
            });
    }

    function likeList() {
        // For now, don't worry about "unliking" a list.
        if (!liked) {
            // Create and publish a reaction event (kind )
            const likeEvent = new NDKEvent($ndk, {
                kind: 7,
                content: '+',
                pubkey: $currentUser?.pubkey as string,
                created_at: unixTimeNow(),
                tags: [
                    ['e', list.id as string],
                    ['a', list.id as string],
                    ['p', $currentUser?.pubkey as string]
                ]
            });
            likeEvent
                .publish()
                .then(() => {
                    liked = true;
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    let itemCount: number;
    $: itemCount = list.publicItems.length + privateItems.length;
</script>

<div class="listWrapper">
    <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center">
        <h2 class="flex flex-row gap-1 items-center md:text-lg break-words font-semibold">
            <button on:click={() => list.toggleExpanded()}>
                <ChevronIcon bind:expanded={list.expanded} />
            </button>
            <a href="/a/{list.nip19}">
                {list.name}
            </a>
        </h2>
        <InfoIcon />
        <Tooltip
            type="custom"
            class="flex flex-col gap-1 text-sm dark:bg-zinc-800 bg-zinc-100 border border-black/20 shadow-xl"
        >
            <span><span class="font-serif text-lg">κ</span> {list.kind}</span>
            <span class="flex md:hidden">
                {itemCount}
                {itemCount === 1 ? 'item' : 'items'}
            </span>
        </Tooltip>
        <span class="hidden md:flex text-sm">
            {itemCount}
            {itemCount === 1 ? 'item' : 'items'}
        </span>
        <div class="ml-auto mr-0 flex flex-row gap-4">
            {#if $currentUser}
                <button on:click={likeList}
                    ><HeartIcon
                        class="opacity-100 w-6 h-6 {liked ? 'fill-red-500 stroke-red-500' : ''}"
                    />
                </button>
            {/if}
            <ZapPopover {list} class="opacity-100" />
            <ItemsOptionsPopover {list} class="opacity-100" on:deleteList={handleDeleteList} />
        </div>
    </div>
    <div class="{list.expanded ? 'flex' : 'hidden'} flex-col gap-2">
        {#each privateItems as privateItem}
            <ListItem item={privateItem} saved={true} privateItem={true} {list} />
        {/each}
        {#each list.publicItems as listItem}
            <ListItem item={listItem} saved={true} {list} />
        {/each}
    </div>
</div>
