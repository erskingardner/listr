<script lang="ts">
    import ListSummary from "$lib/components/lists/ListSummary.svelte";
    import { onDestroy } from "svelte";
    import { filteredLists, FEED_LIST_KINDS } from "$lib/utils";
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
        },
        { closeOnEose: false },
        NDKList
    );

    let followingLists: NDKEventStore<ExtendedBaseType<NDKList>>;

    const followsListReady: Promise<void> = new Promise(async (resolve, reject) => {
        if ($currentUser) {
            const followers = await $currentUser.follows();

            followingLists = $ndk.storeSubscribe(
                {
                    kinds: FEED_LIST_KINDS,
                    authors: Array.from(followers).map((user: NDKUser) => user.hexpubkey),
                    limit: 50,
                },
                { closeOnEose: false },
                NDKList
            );
            resolve();
        } else {
            reject();
        }
    });

    onDestroy(() => {
        globalLists.unsubscribe();
        if (followingLists) followingLists.unsubscribe();
    });

    $: if ($globalLists) $globalLists = filteredLists($globalLists, undefined, true);
    $: if ($followingLists) $followingLists = filteredLists($followingLists, undefined, true);
</script>

<svelte:head>
    <title>Listr</title>
    <meta
        name="description"
        content="A Nostr based app to help you view and manage your own
        Nostr lists and find great content in other people's lists."
    />
</svelte:head>

<div class="flex flex-col gap-2">
    {#if $currentUser}
        {#await followsListReady}
            <div class="flex flex-row items-center justify-center my-12">
                <Loader />
            </div>
        {:then value}
            <Tabs class="border-b border-b-gray-300">
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
                                name={list.name}
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
                            name={list.name}
                            kind={list.kind}
                            date={list.created_at}
                            authorPubkey={list.pubkey}
                            listNip19={list.encode()}
                        />
                    {/each}
                </TabItem>
            </Tabs>
        {:catch error}
            {#each $globalLists as list}
                <ListSummary
                    name={list.name}
                    kind={list.kind}
                    date={list.created_at}
                    authorPubkey={list.pubkey}
                    listNip19={list.encode()}
                />
            {/each}
        {/await}
    {:else}
        {#each $globalLists as list}
            <ListSummary
                name={list.name}
                kind={list.kind}
                date={list.created_at}
                authorPubkey={list.pubkey}
                listNip19={list.encode()}
            />
        {/each}
    {/if}
</div>
