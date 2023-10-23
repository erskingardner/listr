<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import UserDetails from "$lib/components/users/UserDetails.svelte";
    import FollowButton from "../actions/FollowButton.svelte";
    import AddToListButton from "../actions/AddToListButton.svelte";
    import AdditionItemPill from "./AdditionItemPill.svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";
    import Unstage from "../actions/Unstage.svelte";

    export let type: string;
    export let pubkey: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;

    const user = $ndk.getUser({ hexpubkey: pubkey });
</script>

{#key pubkey}
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
            <Unstage {type} id={pubkey} {privateItem} {unsaved} {removal} on:removeUnsavedItem />
        {:else}
            <div class="w-full lg:w-auto lg:ml-auto flex flex-row gap-2 lg:items-center">
                <RemoveItem
                    {type}
                    id={pubkey}
                    {privateItem}
                    {unsaved}
                    {removal}
                    {editMode}
                    on:removeItem
                />
                {#if !editMode}
                    <FollowButton {user} />
                    <AddToListButton {user} />
                    <ItemActions {type} id={pubkey} on:removeItem />
                {/if}
            </div>
        {/if}
    </div>
{/key}
