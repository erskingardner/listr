<script lang="ts">
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import ChevronIcon from '$lib/elements/icons/Chevron.svelte';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import { Tooltip } from 'flowbite-svelte';
    import type List from '$lib/classes/list';
    import ZapPopover from './ZapPopover.svelte';

    export let list: List;
</script>

<div class="listWrapper">
    <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center">
        <h2 class="flex flex-row gap-1 items-center text-lg md:text-2xl break-words font-semibold">
            <button on:click={() => list.toggleExpanded()}>
                <ChevronIcon bind:expanded={list.expanded} />
            </button>
            <a href="/a/{list.nip19}">
                {list.name}
            </a>
        </h2>
        <InfoIcon />
        <Tooltip style="custom" class="dark:bg-zinc-800 bg-zinc-100 shadow-sm">
            Kind: {list.kind}
        </Tooltip>
        <div class="ml-auto mr-0 flex flex-row gap-4">
            <ZapPopover {list} class="opacity-20" />
            <SharePopover {list} class="opacity-20" />
        </div>
    </div>
    <div class="{list.expanded ? 'flex' : 'hidden'} flex-col gap-2">
        {#each list.publicItems as listItem}
            <ListItem item={listItem} saved={true} {list} />
        {/each}
    </div>
</div>
