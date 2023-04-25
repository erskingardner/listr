<script lang="ts">
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import ShareIcon from '$lib/elements/icons/Share.svelte';
    import { copyToClipboard } from '$lib/utils/helpers';
    import ndk from '$lib/stores/ndk';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { nip19 } from 'nostr-tools';

    export let list: App.List | undefined = undefined;
    export let event: NDKEvent | undefined = undefined;
    export let person: App.User | undefined = undefined;
    export let type: string | undefined = undefined;
    export let id: string | undefined = undefined;

    export let klass: string = '';

    let naddrName: string = '';
    let naddr: string = 'naddr';

    async function fetchData() {
        if (list) {
            if (list.kind === 10000 || list.kind === 10001) naddrName = 'note';
            if (list.kind === 30000 || list.kind === 30001) naddrName = 'naddr';
            let ndkEvent = await $ndk.fetchEvent({ ids: [list.listId] }).catch((e) => {
                console.error(e);
            });
            naddr = (ndkEvent as NDKEvent).encode();
            id = list.listId;
        } else if (event) {
            naddrName = 'note';
            naddr = event.encode();
            id = event.id;
        } else if (person) {
            naddrName = 'npub';
            naddr = nip19.npubEncode(person.hexpubkey as string);
            id = person.hexpubkey as string;
        } else if (type) {
            if (type === 'Person' && id) {
                naddrName = 'npub';
                naddr = nip19.npubEncode(id);
            } else if (type === 'Event' && id) {
                naddrName = 'note';
                naddr = nip19.noteEncode(id);
            }
        }
    }

    async function copyNaddr() {
        await fetchData().catch((e) => {
            console.error(e);
        });
        console.log(naddr);
        copyToClipboard(naddr);
    }
    async function copyId() {
        await fetchData().catch((e) => {
            console.error(e);
        });
        console.log(id);
        copyToClipboard(id as string);
    }

    fetchData();
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
                Copy {naddrName}
            </PopoverButton>
            <PopoverButton on:click={copyId} class="popoverPanelLink text-left"
                >Copy ID</PopoverButton
            >
        </div>
    </PopoverPanel>
</Popover>
