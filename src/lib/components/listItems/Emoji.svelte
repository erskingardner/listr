<script lang="ts">
    import { currentUser } from '$lib/stores/currentUser';
    import { page } from '$app/stores';
    import { createEventDispatcher } from 'svelte';
    import type List from '$lib/classes/list';

    const dispatch = createEventDispatcher();

    export let item: string[];
    export let list: List;
    export let saved: boolean;
    export let isFeed: boolean;

    const emojiName: string = item[1];
    const emojiImg: string = item[2];

    // Need to implement
    // function submitRemove() {
    //     dispatch('removeItemFromList', { addr: note.encode(), action: 'delete' });
    // }
</script>

<div class="flex flex-row justify-between gap-6 md:gap-16 w-full">
    <div class="flex flex-row gap-4 items-center">
        <img src={emojiImg} alt={emojiName} class="w-8 h-8" />
        {emojiName}
    </div>
    <!-- <div class="flex flex-col md:flex-row gap-4 items-center noteIconsWrapper opacity-20">
        {#if $currentUser?.hexpubkey === list.authorHexPubkey && saved && !isFeed && $page.url.pathname.startsWith('/a/')}
            <button on:click={submitRemove}>
                <XMarkIcon />
                <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                    Remove this item from the list
                </Tooltip>
            </button>
        {/if}
    </div> -->
</div>
