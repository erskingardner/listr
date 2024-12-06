<script lang="ts">
import UserDetails from "$lib/components/users/UserDetails.svelte";
import ndk from "$lib/stores/ndk.svelte";
import type { ListItemParams } from "$lib/types";
import AddToListButton from "../actions/AddToListButton.svelte";
import FollowButton from "../actions/FollowButton.svelte";
import RemoveItem from "../actions/RemoveItem.svelte";
import Unstage from "../actions/Unstage.svelte";
import AdditionItemPill from "./AdditionItemPill.svelte";
import ItemActions from "./ItemActions.svelte";
import PrivateItemPill from "./PrivateItemPill.svelte";
import RemovalItemPill from "./RemovalItemPill.svelte";

let {
    type,
    pubkey,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    type: string;
    pubkey: string;
    privateItem: boolean;
    otherTagValues: string[] | undefined;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();

let user = $derived(ndk.getUser({ pubkey: pubkey }));
</script>

<div
    class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
    rounded-md p-2 my-2 lg:items-center border
    {unsaved
        ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed'
        : 'border-gray-200 dark:border-gray-700'}"
>
    <div class="grow flex flex-col lg:flex-row gap-2 items-start lg:items-center">
        <UserDetails {user} />
        {#if privateItem}
            <PrivateItemPill />
        {/if}
        {#if removal && unsaved}
            <RemovalItemPill />
        {:else if unsaved}
            <AdditionItemPill />
        {/if}
    </div>
    {#if unsaved}
        <Unstage
            {type}
            id={pubkey}
            {privateItem}
            {otherTagValues}
            {unsaved}
            {removal}
            {removeUnsavedItem}
        />
    {:else}
        <div class="w-full lg:w-auto lg:ml-auto flex flex-row gap-2 lg:items-center">
            <RemoveItem
                {type}
                id={pubkey}
                {privateItem}
                {otherTagValues}
                {unsaved}
                {removal}
                {editMode}
                {removeItem}
            />
            {#if !editMode}
                <FollowButton {user} />
                <AddToListButton {user} />
                <ItemActions {type} id={pubkey} />
            {/if}
        </div>
    {/if}
</div>
