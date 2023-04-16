<script lang="ts">
    import { liveQuery } from 'dexie';
    import { db } from '$lib/interfaces/db';
    import ListItem from '$lib/components/ListItem.svelte';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { Tooltip } from 'flowbite-svelte';

    export let userHexId: string;

    let lists = liveQuery(() => db.lists.where('authorHexPubkey').equals(userHexId).toArray());
    $: console.log($lists);
</script>

<div class="listsWrapper flex flex-col gap-6">
    {#if $lists}
        {#each $lists as list}
            <div class="listWrapper border border-stone-100/20 rounded-lg p-4">
                <div class="flex flex-row gap-4 mb-6 items-center">
                    <h2 class="flex flex-row gap-1 items-center text-2xl font-semibold">
                        <HashIcon />
                        {list.name}
                    </h2>
                    <InfoIcon />
                    <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                        Kind: {list.kind}
                    </Tooltip>
                </div>
                <div class="flex flex-col gap-2">
                    {#each list.publicItems as listItem}
                        <ListItem item={listItem} />
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>
