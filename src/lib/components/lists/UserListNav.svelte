<script lang="ts">
import { type NDKEvent, NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { nip19 } from "nostr-tools";
import { page } from "$app/stores";
import ndk from "$lib/stores/ndk.svelte";
import { filterAndSortByTitle, getListDisplayTitle, SUPPORTED_LIST_KINDS } from "$lib/utils";

let { userPubkey }: { userPubkey: string } = $props();

let listsSub = ndk.$subscribe(() => ({
    filters: [
        {
            kinds: SUPPORTED_LIST_KINDS,
            authors: [userPubkey],
        },
    ],
}));

let deletedEventsSub = ndk.$subscribe(() => ({
    filters: [
        {
            kinds: [NDKKind.EventDeletion],
            authors: [userPubkey],
        },
    ],
}));

let lists = $derived(listsSub.events.map((e: NDKEvent) => NDKList.from(e)));
let deletedEvents = $derived(deletedEventsSub.events);
let filteredLists: NDKList[] = $derived(filterAndSortByTitle(lists, deletedEvents));
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
                {getListDisplayTitle(list)}
            </a>
        {/each}
    {/if}
</div>
