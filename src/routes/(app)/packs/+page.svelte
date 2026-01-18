<script lang="ts">
import { type NDKEvent, NDKList } from "@nostr-dev-kit/ndk";
import { fade } from "svelte/transition";
import FollowPackCard from "$lib/components/lists/FollowPackCard.svelte";
import ndk from "$lib/stores/ndk.svelte";
import { unixTimeNowInSeconds } from "$lib/utils";
import { filterAndSortByTitle } from "$lib/utils/lists";

let currentUser = $derived(ndk.$currentUser);

type FilterType = "all" | "following" | "mine";
let activeFilter: FilterType = $state("all");

let filters = $derived.by(() => {
    const kind = 39089;
    const limit = 50;

    if (activeFilter === "mine" && currentUser) {
        return [{ kinds: [kind], authors: [currentUser.pubkey], limit }];
    }

    if (activeFilter === "following" && currentUser) {
        const follows = Array.from(ndk.$follows);
        if (follows.length > 0) {
            return [{ kinds: [kind], authors: follows, limit }];
        }
        return undefined; // No follows
    }

    // Default: All recent
    return [
        {
            kinds: [kind],
            limit,
            // Optional: limit to recent 2 weeks to avoid fetching old stuff if relay doesn't sort well
            // since: unixTimeNowInSeconds() - 60 * 60 * 24 * 14
        },
    ];
});

let packsSub = ndk.$subscribe(() => {
    if (!filters) return undefined;
    return { filters };
});

let packs = $derived(packsSub.events.map((e: NDKEvent) => NDKList.from(e)));

let filteredPacks = $derived(filterAndSortByTitle(packs));

function setFilter(filter: FilterType) {
    activeFilter = filter;
}
</script>

<svelte:head>
    <title>Starter Packs - Listr</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
        <h1 class="text-3xl font-bold">Starter Packs</h1>
        <p class="text-gray-500 dark:text-gray-400">
            Discover and share curated sets of profiles to follow.
        </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li class="me-2">
                <button
                    onclick={() => setFilter("all")}
                    class="inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group {activeFilter === 'all'
                        ? 'text-indigo-600 border-indigo-600 dark:text-indigo-500 dark:border-indigo-500'
                        : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}"
                >
                    Recent
                </button>
            </li>
            {#if currentUser}
                <li class="me-2">
                    <button
                        onclick={() => setFilter("following")}
                        class="inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group {activeFilter === 'following'
                            ? 'text-indigo-600 border-indigo-600 dark:text-indigo-500 dark:border-indigo-500'
                            : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}"
                    >
                        From People I Follow
                    </button>
                </li>
                <li class="me-2">
                    <button
                        onclick={() => setFilter("mine")}
                        class="inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group {activeFilter === 'mine'
                            ? 'text-indigo-600 border-indigo-600 dark:text-indigo-500 dark:border-indigo-500'
                            : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}"
                    >
                        My Packs
                    </button>
                </li>
            {/if}
        </ul>
    </div>

    <!-- Grid -->
    {#if filteredPacks.length === 0}
        <div class="py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            {#if activeFilter === "following" && Array.from(ndk.$follows).length === 0}
                <p>You aren't following anyone yet.</p>
            {:else if activeFilter === "following"}
                <p>None of the people you follow have created starter packs yet.</p>
            {:else if activeFilter === "mine"}
                <p>You haven't created any starter packs yet.</p>
                <a href="/new" class="text-indigo-600 hover:underline mt-2 inline-block">Create one now</a>
            {:else}
                <p>No starter packs found.</p>
            {/if}
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" transition:fade>
            {#each filteredPacks as pack (pack.id)}
                <FollowPackCard list={pack} />
            {/each}
        </div>
    {/if}
</div>
