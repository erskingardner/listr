<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    import Zap from "./Zap.svelte";
    import Like from "./Like.svelte";
    import CopyId from "./CopyId.svelte";
    import Fork from "./Fork.svelte";
    import Delete from "./Delete.svelte";
    import Edit from "./Edit.svelte";
    import type { NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
    import { FORKABLE_LIST_KINDS } from "$lib/utils";
    import { MoreVertical } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";

    export let nip19: string;
    export let listId: string;
    export let pubkey: string;
    export let rawList: NostrEvent;

    const listKind: NDKKind = rawList.kind as NDKKind;
</script>

{#if $currentUser}
    <div class="ml-auto flex flex-row gap-2 lg:gap-4 items-center">
        <Zap {nip19} {listId} />
        <Like {listId} />
        {#if $currentUser && pubkey !== $currentUser.hexpubkey && FORKABLE_LIST_KINDS.includes(listKind)}
            <Fork {rawList} />
        {/if}
        <button id="listActionsButton" class="ml-auto">
            <MoreVertical strokeWidth="1.5" size="20" class="stroke-gray-500 hover:stroke-black" />
        </button>
        <Popover triggeredBy="#listActionsButton" placement="left-start">
            <div class="flex flex-col gap-2 items-start">
                <CopyId {nip19} />

                <Delete {listId} {pubkey} />
            </div>
        </Popover>
    </div>
{/if}
