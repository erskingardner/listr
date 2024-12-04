<script lang="ts">
import { page } from "$app/stores";
import ndk from "$lib/stores/ndk.svelte";
import { SUPPORTED_LIST_KINDS, filterAndSortByTitle } from "$lib/utils";
import { NDKEvent, NDKKind, NDKList, NDKSubscription } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { onDestroy, onMount } from "svelte";

let { userPubkey }: { userPubkey: string } = $props();

let lists: NDKList[] = $state([]);
let deletedEvents: NDKEvent[] = $state([]);

let listsSub: NDKSubscription | null = $state(null);
let deletedEventsSub: NDKSubscription | null = $state(null);
let filteredLists: NDKList[] = $derived(filterAndSortByTitle(lists, deletedEvents));

onMount(() => {
    listsSub = ndk.subscribe(
        {
            kinds: SUPPORTED_LIST_KINDS,
            authors: [userPubkey],
        },
        { closeOnEose: false }
    );

    listsSub.on("event", (event: NDKEvent) => {
        lists = [...lists, NDKList.from(event)];
    });

    deletedEventsSub = ndk.subscribe(
        {
            kinds: [NDKKind.EventDeletion],
            authors: [userPubkey],
        },
        { closeOnEose: false }
    );

    deletedEventsSub.on("event", (event: NDKEvent) => {
        deletedEvents = [...deletedEvents, event];
    });
});

onDestroy(() => {
    listsSub?.stop();
    deletedEventsSub?.stop();
});
</script>

<div class="flex flex-col gap-0.5">
    {#if filteredLists.length > 0}
        {#each filteredLists as list}
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
