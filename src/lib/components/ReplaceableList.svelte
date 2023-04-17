<script lang="ts">
    import { liveQuery } from 'dexie';
    import { db } from '$lib/interfaces/db';
    import ListItem from '$lib/components/ListItem.svelte';
    import HashIcon from '$lib/elements/icons/Hash.svelte';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { Tooltip } from 'flowbite-svelte';
    import { onMount } from 'svelte';
    import type { Observable } from 'dexie';
    import ReplaceableListInterface from '$lib/interfaces/replaceableLists';

    export let userHexId: string;
    let lists: Observable<App.List[]>;
    onMount(async () => {
        lists = await ReplaceableListInterface.getForUser({ hexpubkey: userHexId });
    });

    // let lists = liveQuery(() => db.lists.where('authorHexPubkey').equals(userHexId).toArray());
</script>

<div class="listsWrapper flex flex-col gap-6">
    {#if $lists && $lists.length > 0}
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
    {:else}
        <h2 class="text-xl">User doesn't have any lists</h2>
    {/if}
</div>
