<script lang="ts">
    import ListSummary from "$lib/components/lists/ListSummary.svelte";
    import { onDestroy } from "svelte";
    import { filteredLists, FEED_LIST_KINDS, unixTimeNowInSeconds } from "$lib/utils";
    import ndk from "$lib/stores/ndk";
    import currentUser from "$lib/stores/currentUser";
    import { NDKList, NDKUser } from "@nostr-dev-kit/ndk";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { Tabs, TabItem } from "flowbite-svelte";
    import Loader from "$lib/components/Loader.svelte";

    const globalLists = $ndk.storeSubscribe(
        {
            kinds: FEED_LIST_KINDS,
            limit: 50,
            since: unixTimeNowInSeconds() - 60 * 60 * 96,
        },
        { closeOnEose: false },
        NDKList
    );

    let followingLists: NDKEventStore<ExtendedBaseType<NDKList>>;

    async function followsListReady(): Promise<boolean> {
        if ($currentUser) {
            const followers = await $currentUser.follows();

            followingLists = $ndk.storeSubscribe(
                {
                    kinds: FEED_LIST_KINDS,
                    authors: Array.from(followers).map((user: NDKUser) => user.hexpubkey),
                    limit: 50,
                    since: unixTimeNowInSeconds() - 60 * 60 * 96,
                },
                { closeOnEose: false },
                NDKList
            );
            return true;
        } else {
            return false;
        }
    }

    onDestroy(() => {
        globalLists.unsubscribe();
        if (followingLists) followingLists.unsubscribe();
    });

    $: if ($globalLists) $globalLists = filteredLists($globalLists, undefined, true);
    $: if ($followingLists) $followingLists = filteredLists($followingLists, undefined, true);
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
        {#if $currentUser}
            {#await followsListReady()}
                <div class="flex flex-row items-center justify-center my-12">
                    <Loader />
                </div>
            {:then followsListAvailable}
                {#if followsListAvailable}
                    <Tabs
                        class="border-b border-b-gray-300"
                        contentClass="p-0 rounded-lg dark:bg-gray-800 mt-4"
                        inactiveClasses="p-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        <TabItem
                            open
                            title="Following"
                            activeClasses="border-b border-b-indigo-600 p-4 text-base"
                            defaultClass="text-base"
                        >
                            {#if $followingLists.length === 0}
                                <div class="flex flex-row items-center justify-center my-12">
                                    <Loader />
                                </div>
                            {:else}
                                {#each $followingLists as list}
                                    <ListSummary
                                        title={list.title}
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
                            style="underline"
                            activeClasses="border-b border-b-indigo-600 p-4 text-base"
                            defaultClass="text-base"
                        >
                            {#each $globalLists as list}
                                <ListSummary
                                    title={list.title}
                                    kind={list.kind}
                                    date={list.created_at}
                                    authorPubkey={list.pubkey}
                                    listNip19={list.encode()}
                                />
                            {/each}
                        </TabItem>
                    </Tabs>
                {:else}
                    {#each $globalLists as list}
                        <ListSummary
                            title={list.title}
                            kind={list.kind}
                            date={list.created_at}
                            authorPubkey={list.pubkey}
                            listNip19={list.encode()}
                        />
                    {/each}
                {/if}
            {/await}
        {:else}
            {#each $globalLists as list}
                <ListSummary
                    title={list.title}
                    kind={list.kind}
                    date={list.created_at}
                    authorPubkey={list.pubkey}
                    listNip19={list.encode()}
                />
            {/each}
        {/if}
    </div>
</div>
