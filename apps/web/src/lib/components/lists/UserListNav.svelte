<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import { onDestroy } from "svelte";
    import { filterAndSort } from "$lib/utils";
    import { NDKKind, NDKList } from "@nostr-dev-kit/ndk";
    import { nip19 } from "nostr-tools";
    import { page } from "$app/stores";

    export let userPubkey: string;

    const lists = $ndk.storeSubscribe(
        {
            kinds: [
                NDKKind.MuteList as number,
                NDKKind.PinList as number,
                NDKKind.CategorizedBookmarkList as number,
                NDKKind.CategorizedPeopleList as number,
                NDKKind.RelayList as number,
                NDKKind.Contacts as number,
            ],
            authors: [userPubkey],
        },
        { closeOnEose: false },
        NDKList
    );

    onDestroy(() => {
        lists.unsubscribe();
    });

    $: $lists = filterAndSort($lists);
</script>

<div class="flex flex-col gap-0.5">
    {#each $lists as list}
        <a
            href="/{nip19.npubEncode(userPubkey)}/{list.kind}/{list.encode()}"
            class="p-2 hover:bg-gray-100 {$page.url.pathname ===
            `/${nip19.npubEncode(userPubkey)}/${list.kind}/${list.encode()}`
                ? 'bg-gray-100'
                : ''} w-full block rounded-md text-left"
        >
            {list.name}
        </a>
    {/each}
</div>
