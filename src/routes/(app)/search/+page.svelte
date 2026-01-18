<script lang="ts">
import { NDKEvent, NDKKind, NDKRelay, NDKRelaySet, type NDKSubscription } from "@nostr-dev-kit/ndk";
import { onDestroy } from "svelte";
import { page } from "$app/stores";
import Loader from "$lib/components/Loader.svelte";
import ListSearchResult from "$lib/components/search/ListSearchResult.svelte";
import UserSearchResult from "$lib/components/search/UserSearchResult.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { SUPPORTED_LIST_KINDS } from "$lib/utils";

const searchRelayUrls = [
    "wss://relay.primal.net",
    "wss://relay.noswhere.com",
    "wss://purplepag.es",
    "wss://search.nos.today",
];

const searchRelays: NDKRelaySet = new NDKRelaySet(new Set(), ndk);
for (const url of searchRelayUrls) {
    searchRelays.addRelay(new NDKRelay(url, undefined, ndk));
}

let query: string | null = $derived($page.url.searchParams.get("q"));
let sub: NDKSubscription | null = $state(null);
let searchResults: NDKEvent[] = $state([]);
let userResults: NDKEvent[] = $state([]);
let listResults: NDKEvent[] = $state([]);
let eoseReceived = $state(false);

$effect(() => {
    if (query) {
        sub = ndk.subscribe({ search: query, limit: 50 }, {}, searchRelays);
    }

    if (sub) {
        sub.on("eose", () => {
            eoseReceived = true;
        });
        sub.on("event", (event: NDKEvent) => {
            searchResults = [...searchResults, event];
        });
    }

    if (searchResults.length > 0) {
        userResults = searchResults.filter((event) => event.kind === NDKKind.Metadata);
        listResults = searchResults.filter((event) =>
            SUPPORTED_LIST_KINDS.includes(event.kind as number)
        );
    }
});

onDestroy(() => {
    sub?.stop();
});
</script>

<svelte:head>
    <title>{query} - Listr</title>
    <meta
        name="description"
        content={`Search results for ${query} on Listr, the best app for creating and managing your Nostr lists.`}
    />
</svelte:head>

<div class="flex flex-col">
    {#if query}
        {#if userResults.length > 0}
            <h2 class="text-xl font-bold mb-4">User Results</h2>
            {#each userResults as event}
                <UserSearchResult {event} />
            {/each}
        {/if}

        {#if listResults.length > 0}
            <h2 class="text-xl font-bold mt-8 mb-4">List Results</h2>
            {#each listResults as event}
                <ListSearchResult {event} />
            {/each}
        {/if}

        {#if eoseReceived && searchResults.length === 0}
            No search results
        {:else if eoseReceived}
            <!-- Loading finished -->
        {:else}
            <Loader extraClasses="mx-auto my-6" />
        {/if}
    {:else}
        Search for something
    {/if}
</div>
