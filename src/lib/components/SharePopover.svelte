<script lang="ts">
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import ShareIcon from '$lib/elements/icons/Share.svelte';
    import { copyToClipboard } from '$lib/utils/helpers';
    import ndk from '$lib/stores/ndk';

    export let list: App.List;
    export let klass: string = '';

    async function copyNaddr(event: Event) {
        const ndkEvent = await $ndk.fetchEvent({ ids: [list.listId] });
        const listNaddr = ndkEvent.encode();
        console.log(listNaddr);
        copyToClipboard(listNaddr);
    }
    function copyId(event: Event) {
        console.log(list.listId);
        copyToClipboard(list.listId);
    }
</script>

<Popover style="position: relative;" class="h-6 w-6 {klass}">
    <PopoverButton class="h-6 w-6">
        <ShareIcon />
    </PopoverButton>

    <PopoverPanel
        style="position: absolute; z-index: 10;"
        class="
            w-48 right-0 flex flex-col
            bg-stone-100 dark:bg-stone-900
            p-4 rounded-lg shadow-md
            border border-stone-200 dark:border-stone-800
        "
    >
        <div class="panel-contents flex flex-col gap-2">
            <PopoverButton on:click={copyNaddr} class="popoverPanelLink text-left">
                Copy list naddr
            </PopoverButton>
            <PopoverButton on:click={copyId} class="popoverPanelLink text-left"
                >Copy list ID</PopoverButton
            >
        </div>
    </PopoverPanel>
</Popover>
