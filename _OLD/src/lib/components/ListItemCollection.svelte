<script lang="ts">
    import type List from '$lib/classes/list';
    import ListItem from './ListItem.svelte';
    import type { NDKTag } from '@nostr-dev-kit/ndk';

    export let collection: NDKTag[];
    export let list: List;
    export let privateItem: boolean;
    export let saved: boolean;
    export let collectionName: string;
    export let action: string | undefined = undefined;
</script>

{#if collection.length > 0}
    {#key collection}
        <div id={collectionName} class="flex flex-col gap-2 mb-2">
            {#each collection as item}
                <ListItem {item} {privateItem} {saved} {list} {action} on:removeItemFromList />
            {/each}
        </div>
    {/key}
{/if}
