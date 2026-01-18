<script lang="ts">
import type { NDKEvent } from "@nostr-dev-kit/ndk";
import { NDKList } from "@nostr-dev-kit/ndk";
import { TabItem, Tabs } from "flowbite-svelte";
import { onMount } from "svelte";
import Loader from "$lib/components/Loader.svelte";
import ListSummary from "$lib/components/lists/ListSummary.svelte";
import ndk from "$lib/stores/ndk.svelte";
import {
    FEED_LIST_KINDS,
    filteredLists,
    getListDisplayTitle,
    unixTimeNowInSeconds,
} from "$lib/utils";

/** Maximum number of authors to include in a single relay filter request */
const MAX_AUTHORS_PER_QUERY = 400;

/** Minimum time to show loader before displaying content */
const MIN_LOADING_TIME_MS = 500;

/** Maximum time to wait before showing content (even if no events) */
const MAX_LOADING_TIME_MS = 5000;

let currentUser = $derived(ndk.$currentUser);

/**
 * Safely get follows as an array.
 * ndk.$follows is a ReactiveFollows which extends Array, but may not be
 * properly initialized before the session loads. The NDK library's
 * ReactiveFollows constructor uses spread syntax which can fail if the
 * underlying session follows Set isn't properly iterable yet.
 */
function getFollowsArray(): string[] {
    try {
        const follows = ndk.$follows;
        if (!follows || !Array.isArray(follows)) {
            return [];
        }
        return [...follows];
    } catch {
        // ReactiveFollows constructor can throw if session.follows isn't iterable
        return [];
    }
}

// Subscribe to global lists
let globalListsSub = ndk.$subscribe(() => ({
    filters: [
        {
            kinds: FEED_LIST_KINDS,
            limit: 50,
            since: unixTimeNowInSeconds() - 60 * 60 * 96,
        },
    ],
}));

// Subscribe to lists from followed users (only when logged in and have follows)
let followingListsSub = ndk.$subscribe(() => {
    if (!currentUser) {
        return undefined;
    }
    const followsArray = getFollowsArray();
    if (followsArray.length === 0) {
        return undefined;
    }
    const followsToQuery = followsArray.slice(0, MAX_AUTHORS_PER_QUERY);
    return {
        filters: [
            {
                kinds: FEED_LIST_KINDS,
                authors: followsToQuery,
                limit: 50,
                since: unixTimeNowInSeconds() - 60 * 60 * 96,
            },
        ],
    };
});

// Derive filtered lists from subscriptions
let globalLists = $derived(
    filteredLists(
        globalListsSub.events.map((e: NDKEvent) => NDKList.from(e)),
        undefined,
        true
    )
);

let followingLists = $derived(
    filteredLists(
        followingListsSub.events.map((e: NDKEvent) => NDKList.from(e)),
        undefined,
        true
    )
);

// Loading state management
// We show loading until either:
// 1. We have events AND minimum loading time has passed, OR
// 2. Maximum loading time has passed (timeout)
let minTimeElapsed = $state(false);
let maxTimeElapsed = $state(false);

onMount(() => {
    const minTimer = setTimeout(() => {
        minTimeElapsed = true;
    }, MIN_LOADING_TIME_MS);

    const maxTimer = setTimeout(() => {
        maxTimeElapsed = true;
    }, MAX_LOADING_TIME_MS);

    return () => {
        clearTimeout(minTimer);
        clearTimeout(maxTimer);
    };
});

// Show loading if:
// - Max time hasn't elapsed AND (min time hasn't elapsed OR we have no events yet)
let loading = $derived(!maxTimeElapsed && (!minTimeElapsed || globalLists.length === 0));
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
            {#if currentUser && followingLists.length > 0}
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
                        {#each followingLists as list}
                            <ListSummary
                                title={getListDisplayTitle(list)}
                                kind={list.kind}
                                date={list.created_at}
                                authorPubkey={list.pubkey}
                                listNip19={list.encode()}
                            />
                        {/each}
                    </TabItem>
                    <TabItem
                        title="Global"
                        activeClass="border-b border-b-indigo-600 p-4 text-base"
                        inactiveClass="p-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-base"
                    >
                        {#if globalLists.length > 0}
                            {#each globalLists as list}
                                <ListSummary
                                    title={getListDisplayTitle(list)}
                                    kind={list.kind}
                                    date={list.created_at}
                                    authorPubkey={list.pubkey}
                                    listNip19={list.encode()}
                                />
                            {/each}
                        {:else}
                            <p class="text-gray-500 dark:text-gray-400 text-center py-8">
                                No recent lists found.
                            </p>
                        {/if}
                    </TabItem>
                </Tabs>
            {:else if globalLists.length > 0}
                {#each globalLists as list}
                    <ListSummary
                        title={getListDisplayTitle(list)}
                        kind={list.kind}
                        date={list.created_at}
                        authorPubkey={list.pubkey}
                        listNip19={list.encode()}
                    />
                {/each}
            {:else}
                <p class="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent lists found. Check back later!
                </p>
            {/if}
        {/if}
    </div>
</div>
