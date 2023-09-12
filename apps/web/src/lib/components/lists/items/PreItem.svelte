<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import type { NDKUser } from "@nostr-dev-kit/ndk";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import CommunityItem from "./CommunityItem.svelte";
    import Unstage from "../actions/Unstage.svelte";
    import RemoveItem from "../actions/RemoveItem.svelte";

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;
    export let editMode: boolean;

    const tagIdSplit = id.split(":");
    const kind: number = parseInt(tagIdSplit[0]);
    const creator: NDKUser = $ndk.getUser({ hexpubkey: tagIdSplit[1] });
    const name: string = tagIdSplit[2];
</script>

{#key id}
    <div
        class="flex flex-row gap-2 rounded-md p-2 my-2 items-center border border-gray-200 {unsaved
            ? 'border-orange-500 border-dashed'
            : ''}"
    >
        <div class="flex flex-row gap-2 w-full items-center">
            {#if kind === 34550}
                <CommunityItem {name} {creator} />
            {:else}
                <pre class="py-2">Unsupported item: <code>{JSON.stringify([type, id])}</code></pre>
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
