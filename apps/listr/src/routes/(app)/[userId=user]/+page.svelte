<script lang="ts">
    import type { PageData } from "./$types";
    import ndk from "$lib/stores/ndk";
    import { onMount, onDestroy } from "svelte";
    import { filterAndSortByName } from "$lib/utils";
    import type { NDKEventStore, ExtendedBaseType } from "@nostr-dev-kit/ndk-svelte";
    import { type NDKEvent, NDKList, NDKKind } from "@nostr-dev-kit/ndk";
    import { SUPPORTED_LIST_KINDS } from "$lib/utils";
    import ListCard from "$lib/components/lists/ListCard.svelte";

    export let data: PageData;
    const user = $ndk.getUser({ hexpubkey: data.pubkey });

    let lists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    onMount(() => {
        lists = $ndk.storeSubscribe(
            {
                kinds: SUPPORTED_LIST_KINDS,
                authors: [data.pubkey],
            },
            { closeOnEose: false },
            NDKList
        );

        deletedEvents = $ndk.storeSubscribe({
            kinds: [NDKKind.EventDeletion],
            authors: [data.pubkey],
        });
    });

    onDestroy(() => {
        lists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    $: if ($lists) {
        $lists = filterAndSortByName($lists, $deletedEvents);
    }
</script>

{#if $lists}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each $lists as list}
            {#key list.id}
                <ListCard npub={user.npub} {list} />
            {/key}
        {/each}
    </div>
{/if}
