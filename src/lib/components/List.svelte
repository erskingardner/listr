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
    import type { NDKTag } from '@nostr-dev-kit/ndk';
    import ItemsOptionsPopover from '$lib/components/ItemsOptionsPopover.svelte';

    export let list: List;

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

    decryptTags();
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
            style="custom"
            class="dark:bg-zinc-800 bg-zinc-100  border border-black/20 shadow-xl"
        >
            Kind: {list.kind}
        </Tooltip>
        <div class="ml-auto mr-0 flex flex-row gap-4">
            <ZapPopover {list} class="opacity-100" />
            <ItemsOptionsPopover {list} class="opacity-100" />
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
