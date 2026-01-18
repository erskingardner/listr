<script lang="ts">
import { NDKList } from "@nostr-dev-kit/ndk";
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

let currentUser = $derived(getCurrentUser());
let loading = $state(true);
let globalLists: NDKList[] | null = $state(null);
let followingLists: NDKList[] | null = $state(null);

onMount(async () => {
    ndk.fetchEvents({
        kinds: FEED_LIST_KINDS,
        limit: 50,
        since: unixTimeNowInSeconds() - 60 * 60 * 96,
    })
        .then((events) => {
            globalLists = filteredLists(
                Array.from(events).map((event) => NDKList.from(event)),
                undefined,
                true
            );
        })
        .catch((e) => {
            console.error("Error fetching global lists", e);
        })
        .finally(() => {
            loading = false;
        });

    // TODO: This isn't ever returning anything from the fetchEvents call
    if (currentUser && currentUser.follows.length > 0) {
        ndk.fetchEvents({
            kinds: FEED_LIST_KINDS,
            authors: currentUser.follows,
            limit: 50,
            since: unixTimeNowInSeconds() - 60 * 60 * 96,
        })
            .then((events) => {
                followingLists = filteredLists(
                    Array.from(events).map((event) => NDKList.from(event)),
                    undefined,
                    true
                );
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
                contentClass="p-0 rounded-lg dark:bg-gray-800 mt-4"
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
