<script lang="ts">
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import ChevronIcon from '$lib/elements/icons/Chevron.svelte';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import ListItem from '$lib/components/ListItem.svelte';
    import { Tooltip } from 'flowbite-svelte';
    import { pointerForList } from '$lib/utils/helpers';
    import { toggleExpanded } from '$lib/interfaces/lists';

    export let list: App.List;
</script>

<div class="listWrapper">
    <div class="flex flex-row gap-2 md:gap-4 mb-6 items-center">
        <h2 class="flex flex-row gap-1 items-center text-lg md:text-2xl break-words font-semibold">
            <button on:click={toggleExpanded(list)}>
                <ChevronIcon bind:expanded={list.expanded} />
            </button>
            <a href="/a/{pointerForList(list)}">
                {list.name}
            </a>
        </h2>
        <InfoIcon />
        <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
            Kind: {list.kind}
        </Tooltip>
        <SharePopover {list} klass="mr-0 ml-auto opacity-20" />
    </div>
    <div class="{list.expanded ? 'flex' : 'hidden'} flex-col gap-2">
        {#each list.publicItems as listItem}
            <ListItem item={listItem} saved={true} {list} />
        {/each}
    </div>
</div>
