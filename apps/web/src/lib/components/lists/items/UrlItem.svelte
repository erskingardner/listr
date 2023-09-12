<script lang="ts">
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import { Tooltip } from "flowbite-svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";
    import Unstage from "../actions/Unstage.svelte";

    export let type: string;
    export let id: string;
    export let otherTagValues: string[];
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;
</script>

{#key id}
    <div
        class="flex flex-row gap-2 rounded-md p-2 my-2 items-center border border-gray-200 {unsaved
            ? 'border-orange-500 border-dashed'
            : ''}"
    >
        <div class="flex flex-row gap-2 w-full">
            {#if otherTagValues.length > 0}
                <a href={id} class="hover:underline text-sm lg:text-base" target="_blank"
                    >{otherTagValues[0]}</a
                >
                <Tooltip type="light">{id}</Tooltip>
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
                    <ItemActions {type} {id} {privateItem} {unsaved} {removal} on:removeItem />
                {/if}
            </div>
        </div>
    </div>
{/key}
