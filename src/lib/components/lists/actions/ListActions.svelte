<script lang="ts">
import { getCurrentUser } from "$lib/stores/currentUser.svelte";
import { DUPLICATABLEABLE_LIST_KINDS } from "$lib/utils";
import type { NDKKind, NostrEvent } from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { MessagesSquare, MoreVertical } from "lucide-svelte";
import CopyId from "./CopyId.svelte";
import Delete from "./Delete.svelte";
import Duplicate from "./Duplicate.svelte";
import Edit from "./Edit.svelte";
// import Zap from "./ZapListButton.svelte";
import Like from "./Like.svelte";
import Share from "./Share.svelte";

let currentUser = $derived(getCurrentUser());

let {
    nip19,
    listId,
    pubkey,
    rawList,
    editMode,
    toggleEditMode,
}: {
    nip19: string;
    listId: string;
    pubkey: string;
    rawList: NostrEvent;
    editMode: boolean;
    toggleEditMode: () => void;
} = $props();

const listKind: NDKKind = $derived(rawList.kind as NDKKind);
</script>

<div class="lg:ml-auto w-full lg:w-auto flex flex-row gap-2 lg:gap-4 items-center justify-between">
    <!-- <Zap {nip19} {listId} /> -->
    <Like {listId} />
    <!-- <button on:click={() => dispatch("toggleConversationDrawer")}>
        <MessagesSquare strokeWidth="1.5" size="20" />
    </button> -->

    <Share {pubkey} {rawList} {nip19} />
    {#if currentUser.user}
        {#if currentUser.user.pubkey !== pubkey && DUPLICATABLEABLE_LIST_KINDS.includes(listKind)}
            <Duplicate {rawList} />
        {/if}

        <Edit {pubkey} {editMode} {toggleEditMode} />
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
