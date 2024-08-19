<script lang="ts">
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import Unstage from "../actions/Unstage.svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";

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
        class="flex flex-col w-full lg:w-auto lg:flex-row gap-4 lg:gap-2
        rounded-md p-2 my-2 lg:items-center border
        {unsaved
            ? 'border-gray-500/60 dark:border-gray-100/30 border-dashed'
            : 'border-gray-200 dark:border-gray-700'}"
    >
        <div class="flex flex-col {editMode ? 'gap-2' : ''} lg:flex-row w-full lg:items-center">
            <div class="flex flex-row gap-2 items-center">
                <img src={otherTagValues[0]} class="w-12 h-12" alt={id} />
                <span class="break-all text-sm lg:text-base">:{id}:</span>
                {#if privateItem}
                    <PrivateItemPill />
                {/if}
                {#if !editMode && !unsaved}
                    <div class="lg:hidden ml-auto">
                        <ItemActions {type} {id} on:removeItem />
                    </div>
                {/if}
            </div>
            <div
                class="flex flex-col lg:flex-row gap-2 items-start lg:items-center lg:ml-auto text-sm"
            >
                {#if unsaved}
                    {#if removal}
                        <RemovalItemPill />
                    {/if}
                    <Unstage
                        {type}
                        {id}
                        {privateItem}
                        {unsaved}
                        {otherTagValues}
                        {removal}
                        on:removeUnsavedItem
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
                        on:removeItem
                    />
                    {#if !editMode}
                        <div class="hidden lg:block">
                            <ItemActions {type} {id} on:removeItem />
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/key}
