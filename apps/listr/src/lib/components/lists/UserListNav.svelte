<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { onMount, onDestroy } from "svelte";
    import { SUPPORTED_LIST_KINDS, filterAndSortByTitle } from "$lib/utils";
    import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
    import { NDKList, NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
    import { nip19 } from "nostr-tools";
    import { page } from "$app/stores";

    export let userPubkey: string;

    let lists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    onMount(() => {
        lists = $ndk.storeSubscribe(
            {
                kinds: SUPPORTED_LIST_KINDS,
                authors: [userPubkey],
            },
            { closeOnEose: false },
            NDKList
        );

        deletedEvents = $ndk.storeSubscribe({
            kinds: [NDKKind.EventDeletion],
            authors: [userPubkey],
        });
    });

    onDestroy(() => {
        lists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    $: if ($lists) {
        $lists = filterAndSortByTitle($lists, $deletedEvents);
    }
</script>

<div class="flex flex-col gap-0.5">
    {#if $lists}
        {#each $lists as list}
            <a
                href="/{nip19.npubEncode(userPubkey)}/{list.kind}/{list.encode()}"
                class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold {$page.url
                    .pathname === `/${nip19.npubEncode(userPubkey)}/${list.kind}/${list.encode()}`
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''} w-full block rounded-md text-left truncate"
            >
                {list.title}
            </a>
        {/each}
    {/if}
</div>
