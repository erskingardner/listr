<script lang="ts">
import { Tag } from "lucide-svelte";
import type { ListItemParams } from "$lib/types";
import RemoveItem from "../actions/RemoveItem.svelte";
import Unstage from "../actions/Unstage.svelte";
import ItemActions from "./ItemActions.svelte";
import PrivateItemPill from "./PrivateItemPill.svelte";
import RemovalItemPill from "./RemovalItemPill.svelte";

let {
    type,
    id,
    privateItem,
    otherTagValues,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    type: string;
    id: string;
    privateItem: boolean;
    otherTagValues: string[] | undefined;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();
</script>

{#key id}
    <div
        class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
        rounded-md p-2 my-2 lg:items-center border
        {unsaved
            ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed'
            : 'border-gray-200 dark:border-gray-700'}"
    >
        <div class="flex flex-row gap-2 w-full items-center">
            <Tag strokeWidth="1.5" size="24" />
            {id}
            {#if privateItem}
                <PrivateItemPill />
            {/if}
            <div class="flex flex-row gap-2 items-center ml-auto text-sm">
                {#if unsaved}
                    {#if removal}
                        <RemovalItemPill />
                    {/if}
                    <Unstage
                        {type}
                        {id}
                        {privateItem}
                        {otherTagValues}
                        {unsaved}
                        {removal}
                        {removeUnsavedItem}
                    />
                {:else}
                    <RemoveItem
                        {type}
                        {id}
                        {privateItem}
                        {otherTagValues}
                        {unsaved}
                        {removal}
                        {editMode}
                        {removeItem}
                    />
                    <ItemActions {type} {id} />
                {/if}
            </div>
        </div>
    </div>
{/key}
