<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { beforeUpdate, onMount, onDestroy } from "svelte";
    import { afterNavigate } from "$app/navigation";
    import { SUPPORTED_LIST_KINDS, filterAndSort } from "$lib/utils";
    import type { ExtendedBaseType, NDKEventStore } from "@nostr-dev-kit/ndk-svelte";
    import { NDKList, NDKEvent, NDKKind } from "@nostr-dev-kit/ndk";
    import { nip19 } from "nostr-tools";
    import { page } from "$app/stores";

    export let userPubkey: string;

    let lists: NDKEventStore<ExtendedBaseType<NDKList>>;
    let deletedEvents: NDKEventStore<ExtendedBaseType<NDKEvent>>;

    onMount(() => {
        lists = $ndk.storeSubscribe(
            {
                kinds: SUPPORTED_LIST_KINDS,
                authors: [userPubkey],
            },
            { closeOnEose: false },
            NDKList
        );

        deletedEvents = $ndk.storeSubscribe({
            kinds: [NDKKind.EventDeletion],
            authors: [userPubkey],
        });
    });

    // beforeUpdate(() => {
    //     lists?.unsubscribe();
    //     deletedEvents?.unsubscribe();
    // });

    onDestroy(() => {
        lists?.unsubscribe();
        deletedEvents?.unsubscribe();
    });

    // afterNavigate(() => {
    //     lists = $ndk.storeSubscribe(
    //         {
    //             kinds: SUPPORTED_LIST_KINDS,
    //             authors: [userPubkey],
    //         },
    //         { closeOnEose: false },
    //         NDKList
    //     );

    //     deletedEvents = $ndk.storeSubscribe({
    //         kinds: [NDKKind.EventDeletion],
    //         authors: [userPubkey],
    //     });
    // });

    $: if ($lists) {
        $lists = filterAndSort($lists, $deletedEvents);
    }
</script>

<div class="flex flex-col gap-0.5">
    {#if $lists}
        {#each $lists as list}
            <a
                href="/{nip19.npubEncode(userPubkey)}/{list.kind}/{list.encode()}"
                class="p-2 hover:bg-gray-100 font-semibold {$page.url.pathname ===
                `/${nip19.npubEncode(userPubkey)}/${list.kind}/${list.encode()}`
                    ? 'bg-gray-100'
                    : ''} w-full block rounded-md text-left truncate"
            >
                {list.name}
            </a>
        {/each}
    {/if}
</div>
