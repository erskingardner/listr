<script lang="ts">
import type { ListItemParams } from "$lib/types";
import { kindIsRelayList } from "$lib/utils";
import { Tooltip } from "flowbite-svelte";
import { Database, Link } from "lucide-svelte";
import RemoveItem from "../actions/RemoveItem.svelte";
import Unstage from "../actions/Unstage.svelte";
import ItemActions from "./ItemActions.svelte";
import PrivateItemPill from "./PrivateItemPill.svelte";
import RelayPill from "./RelayPill.svelte";
import RemovalItemPill from "./RemovalItemPill.svelte";

let {
    type,
    id,
    listKind,
    otherTagValues,
    privateItem,
    unsaved,
    removal,
    editMode,
    removeItem,
    removeUnsavedItem,
}: {
    type: string;
    id: string;
    listKind: number | undefined;
    otherTagValues: string[] | undefined;
    privateItem: boolean;
    unsaved: boolean;
    removal: boolean;
    editMode: boolean;
    removeItem: (params: ListItemParams) => void;
    removeUnsavedItem: (params: ListItemParams) => void;
} = $props();
</script>

{#key id}
    <div
        class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2 rounded-md p-2 my-2 lg:items-center border {unsaved ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed': 'border-gray-200 dark:border-gray-700'}">
        <div class="flex flex-row gap-2 w-full items-center">
            {#if listKind && kindIsRelayList(listKind)}
                <Database strokeWidth="1.5" size="24" />
                {id}
                <RelayPill marker={otherTagValues?.[0]} />
            {:else if otherTagValues && otherTagValues.length > 0}
                <a href={id} class="hover:underline text-sm lg:text-base" target="_blank">
                    {otherTagValues[0]}
                </a>
                <Tooltip type="auto" class="dark:border-gray-800 dark:text-gray-50 shadow-md z-50">
                    {id}
                </Tooltip>
            {:else}
                <Link strokeWidth="1.5" size="24" />
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
                    <Unstage {type} {id} {privateItem} {otherTagValues} {unsaved} {removal} {removeUnsavedItem} />
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
