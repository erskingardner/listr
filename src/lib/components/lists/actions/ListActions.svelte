<script lang="ts">
    import currentUser from "$lib/stores/currentUser";
    // import Zap from "./ZapListButton.svelte";
    import Like from "./Like.svelte";
    import CopyId from "./CopyId.svelte";
    import Duplicate from "./Duplicate.svelte";
    import Share from "./Share.svelte";
    import Delete from "./Delete.svelte";
    import type { NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
    import { DUPLICATABLEABLE_LIST_KINDS } from "$lib/utils";
    import { MessagesSquare, MoreVertical } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import Edit from "./Edit.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let nip19: string;
    export let listId: string;
    export let pubkey: string;
    export let rawList: NostrEvent;
    export let editMode: boolean;

    const listKind: NDKKind = rawList.kind as NDKKind;
</script>

<div class="lg:ml-auto w-full lg:w-auto flex flex-row gap-2 lg:gap-4 items-center justify-between">
    <!-- <Zap {nip19} {listId} /> -->
    <Like {listId} />
    <!-- <button on:click={() => dispatch("toggleConversationDrawer")}>
        <MessagesSquare strokeWidth="1.5" size="20" />
    </button> -->

    <Share {pubkey} {rawList} {nip19} />
    {#if $currentUser}
        {#if $currentUser && pubkey !== $currentUser.pubkey && DUPLICATABLEABLE_LIST_KINDS.includes(listKind)}
            <Duplicate {rawList} />
        {/if}

        <Edit {pubkey} {editMode} on:toggleEditMode />
        <button id="listActionsButton" class="lg:ml-auto">
            <MoreVertical
                strokeWidth="1.5"
                size="20"
                class="stroke-gray-500 hover:stroke-black hover:dark:stroke-white w-5 h-5"
            />
        </button>
        <Popover triggeredBy="#listActionsButton" placement="left-start">
            <div class="flex flex-col gap-2 items-start">
                <CopyId {nip19} />
                <Delete {listId} {pubkey} />
            </div>
        </Popover>
    {/if}
</div>
