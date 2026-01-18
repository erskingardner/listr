<script lang="ts">
import type { NDKKind, NDKTag, NostrEvent } from "@nostr-dev-kit/ndk";
import { Popover } from "flowbite-svelte";
import { MoreVertical } from "lucide-svelte";
import ndk from "$lib/stores/ndk.svelte";
import { DUPLICATABLEABLE_LIST_KINDS } from "$lib/utils";
import CopyId from "./CopyId.svelte";
import Delete from "./Delete.svelte";
import Duplicate from "./Duplicate.svelte";
import Edit from "./Edit.svelte";
import FollowAllButton from "./FollowAllButton.svelte";
// import Zap from "./ZapListButton.svelte";
import Like from "./Like.svelte";
import Share from "./Share.svelte";

let currentUser = $derived(ndk.$currentUser);

let {
    nip19,
    listId,
    pubkey,
    rawList,
    editMode,
    toggleEditMode,
    publicItems = [],
}: {
    nip19: string;
    listId: string;
    pubkey: string;
    rawList: NostrEvent;
    editMode: boolean;
    toggleEditMode: () => void;
    publicItems?: NDKTag[];
} = $props();

const listKind: NDKKind = $derived(rawList.kind as NDKKind);

/**
 * Check if the list contains any user (p-tag) items
 */
const hasUserItems = $derived(publicItems.some((tag) => tag[0] === "p"));
</script>

<div class="lg:ml-auto w-full lg:w-auto flex flex-row gap-2 lg:gap-4 items-center justify-between">
    <!-- <Zap {nip19} {listId} /> -->
    <Like {listId} />
    <!-- <button on:click={() => dispatch("toggleConversationDrawer")}>
        <MessagesSquare strokeWidth="1.5" size="20" />
    </button> -->

    <Share {pubkey} {rawList} {nip19} />
    {#if currentUser && hasUserItems}
        <FollowAllButton {publicItems} />
    {/if}
    {#if currentUser}
        {#if currentUser.pubkey !== pubkey && DUPLICATABLEABLE_LIST_KINDS.includes(listKind)}
            <Duplicate {rawList} />
        {/if}

        <Edit {pubkey} {editMode} {toggleEditMode} />
        <button id="listActionsButton" class="lg:ml-auto">
            <MoreVertical
                strokeWidth="1.5"
                size="20"
                class="stroke-gray-500 hover:stroke-black dark:hover:stroke-white w-5 h-5"
            />
        </button>
        <Popover triggeredBy="#listActionsButton" placement="left-start">
            <div class="flex flex-col gap-2 items-start">
                <CopyId {nip19} />
                <Delete {listId} {pubkey} listDeleted={() => {}} />
            </div>
        </Popover>
    {/if}
</div>
