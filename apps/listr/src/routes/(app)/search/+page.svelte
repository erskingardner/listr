<script lang="ts">
    import { page } from "$app/stores";
    import ndk from "$lib/stores/ndk";
    import { SUPPORTED_LIST_KINDS } from "$lib/utils";
    import { onDestroy } from "svelte";
    import { NDKEvent, NDKKind, NDKRelay, NDKRelaySet } from "@nostr-dev-kit/ndk";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import UserSearchResult from "$lib/components/search/UserSearchResult.svelte";
    import ListSearchResult from "$lib/components/search/ListSearchResult.svelte";
    import Loader from "$lib/components/Loader.svelte";

    let query: string | null = $page.url.searchParams.get("q");
    let searchResults: NDKEventStore<ExtendedBaseType<NDKEvent>>;
    let eoseReceived: boolean = false;
    const searchRelays: NDKRelaySet = new NDKRelaySet(new Set(), $ndk);
    searchRelays.addRelay(new NDKRelay("wss://relay.nostr.band"));
    searchRelays.addRelay(new NDKRelay("wss://nostr.wine"));
    searchRelays.addRelay(new NDKRelay("wss://relay.noswhere.com"));
    searchRelays.addRelay(new NDKRelay("wss://purplepag.es"));
    searchRelays.addRelay(new NDKRelay("wss://search.nos.today"));

    if (query) {
        searchResults = $ndk.storeSubscribe({ search: query });
    }

    function queryChanged() {
        query = $page.url.searchParams.get("q");
        if (query) {
            searchResults = $ndk.storeSubscribe({ search: query }, { relaySet: searchRelays });
            setTimeout(() => {
                eoseReceived = true;
            }, 7000);
        }
    }

    onDestroy(() => {
        if (searchResults) searchResults.unsubscribe();
    });

    let userResults: NDKEvent[] = [];
    let listResults: NDKEvent[] = [];

    $: {
        if ($searchResults) {
            userResults = $searchResults.filter((event) => event.kind === NDKKind.Metadata);
            listResults = $searchResults.filter((event) =>
                SUPPORTED_LIST_KINDS.includes(event.kind as number)
            );
        }
    }

    $: if (searchResults) searchResults.onEose(() => (eoseReceived = true));
    $: $page.url.searchParams.get("q") && queryChanged();
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

        {#if eoseReceived && $searchResults.length === 0}
            No search results
        {:else if eoseReceived}
            <!-- Loading finished -->
        {:else}
            <Loader class="mx-auto my-6" />
        {/if}
    {:else}
        Search for something
    {/if}
</div>
