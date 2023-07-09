<script lang="ts">
    import { Popover, PopoverButton, PopoverPanel } from '@rgossiaux/svelte-headlessui';
    import { copyToClipboard } from '$lib/utils/helpers';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { nip19 } from 'nostr-tools';
    import type List from '$lib/classes/list';
    import type User from '$lib/classes/user';
    import ThreeDotsIcon from '$lib/elements/icons/ThreeDots.svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import LinkIcon from '$lib/elements/icons/Link.svelte';
    import FingerprintIcon from '$lib/elements/icons/Fingerprint.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { createEventDispatcher } from 'svelte';
    import { currentUser } from '$lib/stores/currentUser';

    const dispatch = createEventDispatcher();

    export let list: List | undefined = undefined;
    export let event: NDKEvent | undefined = undefined;
    export let person: User | undefined = undefined;
    export let type: string | undefined = undefined;
    export let id: string | undefined = undefined;

    let naddrName: string = '';
    let naddr: string = 'naddr';
    let itemLink: string;

    async function fetchData() {
        if (list) {
            if (list.kind === 10000 || list.kind === 10001) naddrName = 'note';
            if (list.kind === 30000 || list.kind === 30001) naddrName = 'naddr';
            naddr = list.nip19!;
            id = list.id;
            itemLink = `https://listr.lol/a/${naddr}`;
        } else if (event) {
            naddrName = 'note';
            naddr = event.encode();
            id = event.id;
            itemLink = `https://primal.net/thread/${naddr}`;
        } else if (person) {
            naddrName = 'npub';
            naddr = nip19.npubEncode(person.pubkey as string);
            id = person.pubkey as string;
            itemLink = `https://primal.net/profile/${naddr}`;
        } else if (type) {
            if (type === 'Person' && id) {
                naddrName = 'npub';
                naddr = nip19.npubEncode(id);
                itemLink = `https://primal.net/profile/${naddr}`;
            } else if (type === 'Event' && id) {
                naddrName = 'note';
                naddr = nip19.noteEncode(id);
                itemLink = `https://primal.net/thread/${naddr}`;
            }
        }
    }

    async function copyListrUrl() {
        await fetchData().catch((e) => {
            console.error(e);
        });
        console.log(itemLink);
        copyToClipboard(itemLink);
    }

    async function copyNaddr() {
        await fetchData().catch((e) => {
            console.error(e);
        });
        console.log(naddr);
        copyToClipboard(naddr);
    }

    fetchData();
</script>

<Popover
    style="position: relative;"
    class="sharePopoverWrapper items-center w-4 h-4 md:h-6 md:w-6 text-sm {$$props.class}"
>
    <PopoverButton class="w-4 h-4 md:h-6 md:w-6 hover:text-zinc-700 hover:dark:text-zinc-400">
        <ThreeDotsIcon class="w-4 h-4 md:h-6 md:w-6" />
    </PopoverButton>

    <PopoverPanel
        style="position: absolute; z-index: 10;"
        class="
            w-48 right-0 flex flex-col
            bg-zinc-100 dark:bg-zinc-900
            p-4 rounded-lg shadow-md
            border border-zinc-200 dark:border-zinc-800
        "
    >
        <div class="panel-contents flex flex-col gap-2">
            <PopoverButton
                on:click={copyListrUrl}
                class="popoverPanelLink text-left flex flex-row gap-2 items-center"
            >
                <LinkIcon class="w-4 h-4" />
                Copy link
            </PopoverButton>
            <PopoverButton
                on:click={copyNaddr}
                class="popoverPanelLink text-left flex flex-row gap-2 items-center"
            >
                <FingerprintIcon class="w-4 h-4" />
                Copy {naddrName} ID
            </PopoverButton>
            {#if naddrName === 'naddr' && list?.authorPubkey === $currentUser?.pubkey}
                <PopoverButton
                    on:click={() => dispatch('deleteList')}
                    class="popoverPanelLink text-left flex flex-row gap-2 items-center"
                >
                    <XMarkIcon class="w-4 h-4" />
                    Delete List
                </PopoverButton>
            {/if}
            {#if naddrName !== 'naddr'}
                <PopoverButton
                    as="a"
                    href={itemLink}
                    target="_blank"
                    class="popoverPanelLink text-left flex flex-row gap-2 items-center"
                >
                    <LinkOutIcon class="w-4 h-4" />
                    View in Primal
                </PopoverButton>
            {/if}
        </div>
    </PopoverPanel>
</Popover>
