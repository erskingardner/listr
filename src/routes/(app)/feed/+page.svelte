<script lang="ts">
import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";
import { TabItem, Tabs } from "flowbite-svelte";
import { onMount } from "svelte";
import Loader from "$lib/components/Loader.svelte";
import ListSummary from "$lib/components/lists/ListSummary.svelte";
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import ndk from "$lib/stores/ndk.svelte";
import {
    FEED_LIST_KINDS,
    filteredLists,
    getListDisplayTitle,
    unixTimeNowInSeconds,
} from "$lib/utils";

/** Maximum number of authors to include in a single relay filter request */
const MAX_AUTHORS_PER_QUERY = 400;

let currentUser = $derived(getCurrentUser());
let loading = $state(true);
let globalLists: NDKList[] | null = $state(null);
let followingLists: NDKList[] | null = $state(null);

/**
 * Batch fetches user profiles for a list of pubkeys.
 * This avoids the N+1 problem where each component fetches its own profile.
 */
async function batchFetchProfiles(pubkeys: string[]): Promise<void> {
    if (pubkeys.length === 0) return;

    const uniquePubkeys = [...new Set(pubkeys)];
    try {
        await ndk.fetchEvents({
            kinds: [NDKKind.Metadata],
            authors: uniquePubkeys.slice(0, MAX_AUTHORS_PER_QUERY),
        });
    } catch (e) {
        console.error("Error batch fetching profiles", e);
    }
}

onMount(async () => {
    ndk.fetchEvents({
        kinds: FEED_LIST_KINDS,
        limit: 50,
        since: unixTimeNowInSeconds() - 60 * 60 * 96,
    })
        .then(async (events) => {
            const lists = filteredLists(
                Array.from(events).map((event) => NDKList.from(event)),
                undefined,
                true
            );
            globalLists = lists;

            // Batch fetch profiles for all authors in the list
            const authorPubkeys = lists.map((list) => list.pubkey);
            await batchFetchProfiles(authorPubkeys);
        })
        .catch((e) => {
            console.error("Error fetching global lists", e);
        })
        .finally(() => {
            loading = false;
        });

    // Fetch lists from followed users, limiting authors to avoid relay filter size limits
    if (currentUser && currentUser.follows.length > 0) {
        const followsToQuery = currentUser.follows.slice(0, MAX_AUTHORS_PER_QUERY);
        ndk.fetchEvents({
            kinds: FEED_LIST_KINDS,
            authors: followsToQuery,
            limit: 50,
            since: unixTimeNowInSeconds() - 60 * 60 * 96,
        })
            .then(async (events) => {
                const lists = filteredLists(
                    Array.from(events).map((event) => NDKList.from(event)),
                    undefined,
                    true
                );
                followingLists = lists;

                // Batch fetch profiles for all authors in the list
                const authorPubkeys = lists.map((list) => list.pubkey);
                await batchFetchProfiles(authorPubkeys);
            })
            .catch((e) => {
                console.error("Error fetching following lists", e);
            });
    }
});
</script>

<svelte:head>
    <title>Activity Feed - Listr</title>
    <meta
        name="description"
        content="A Nostr based app to help you view and manage your own
        Nostr lists and find great content in other people's lists."
    />
</svelte:head>

<div
    class="flex flex-col gap-2 border border-gray-30 dark:border-gray-700 rounded-md shadow-md p-4 grow"
>
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div class="flex flex-col gap-1 w-full lg:w-auto">
            <div
                class="text-base lg:text-lg font-bold flex flex-row justify-start items-center gap-2"
            >
                Activity Feed
            </div>
        </div>
    </div>
    <hr class="dark:border-gray-700" />
    <div class="flex flex-col gap-2">
        {#if loading}
            <div class="flex flex-row items-center justify-center my-12">
                <Loader />
            </div>
        {:else}
            {#if currentUser && followingLists && followingLists.length > 0 && globalLists && globalLists.length > 0}
            <Tabs
                class="border-b border-b-gray-300"
                classes={{ content: "p-0 rounded-lg dark:bg-gray-800 mt-4" }}
            >
                    <TabItem
                        open
                        title="Following"
                        activeClass="border-b border-b-indigo-600 p-4 text-base"
                        inactiveClass="p-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-base"
                    >
                        {#if followingLists.length === 0}
                            <div class="flex flex-row items-center justify-center my-12">
                                <Loader />
                            </div>
                        {:else}
                            {#each followingLists as list}
                                <ListSummary
                                    title={getListDisplayTitle(list)}
                                    kind={list.kind}
                                    date={list.created_at}
                                    authorPubkey={list.pubkey}
                                    listNip19={list.encode()}
                                />
                            {/each}
                        {/if}
                    </TabItem>
                    <TabItem
                        title="Global"
                        activeClass="border-b border-b-indigo-600 p-4 text-base"
                        inactiveClass="p-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-base"
                    >
                        {#each globalLists as list}
                            <ListSummary
                                title={getListDisplayTitle(list)}
                                kind={list.kind}
                                date={list.created_at}
                                authorPubkey={list.pubkey}
                                listNip19={list.encode()}
                            />
                        {/each}
                    </TabItem>
                </Tabs>
            {:else if globalLists && globalLists.length > 0}
                {#each globalLists as list}
                    <ListSummary
                        title={getListDisplayTitle(list)}
                        kind={list.kind}
                        date={list.created_at}
                        authorPubkey={list.pubkey}
                        listNip19={list.encode()}
                    />
                {/each}
            {/if}
        {/if}
    </div>
</div>
