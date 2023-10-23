<script lang="ts">
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import { Tooltip } from "flowbite-svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";
    import Unstage from "../actions/Unstage.svelte";
    import RelayPill from "./RelayPill.svelte";

    export let type: string;
    export let id: string;
    export let kind: number;
    export let otherTagValues: string[];
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;
</script>

{#key id}
    <div
        class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
        rounded-md p-2 my-2 lg:items-center border border-gray-200 dark:border-gray-700
        {unsaved ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed' : ''}"
    >
        <div class="flex flex-row gap-2 w-full items-center">
            {#if kind === 10002}
                {id}
                <RelayPill marker={otherTagValues[0]} />
            {:else if otherTagValues.length > 0}
                <a href={id} class="hover:underline text-sm lg:text-base" target="_blank">
                    {otherTagValues[0]}
                </a>
                <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md z-50">
                    {id}
                </Tooltip>
            {:else}
                {id}
            {/if}

            {#if privateItem}
                <PrivateItemPill />
            {/if}
            <div class="flex flex-row gap-2 items-center ml-auto text-sm">
                {#if unsaved}
                    {#if removal}
                        <RemovalItemPill />
                    {/if}
                    <Unstage {type} {id} {privateItem} {unsaved} {removal} on:removeUnsavedItem />
                {:else}
                    <RemoveItem
                        {type}
                        {id}
                        {privateItem}
                        {unsaved}
                        {removal}
                        {editMode}
                        on:removeItem
                    />
                    <ItemActions {type} {id} on:removeItem />
                {/if}
            </div>
        </div>
    </div>
{/key}
