<script lang="ts">
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import UserInterface from '$lib/interfaces/users';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { nip19 } from 'nostr-tools';
    import type { Observable } from 'dexie';
    import SharePopover from './SharePopover.svelte';
    import ndk from '$lib/stores/ndk';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { currentUser } from '$lib/stores/currentUser';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';

    const dispatch = createEventDispatcher();

    export let item: string[];
    export let saved: boolean;
    export let action: string | undefined = undefined;
    export let list: App.List;

    let itemType: string;
    let itemId: string = item[1];
    let encodedNoteId: string = '';
    let person: Observable<App.User>;
    let note: NDKEvent;

    if (item[0] === 'e') {
        itemType = 'Event';
        try {
            encodedNoteId = nip19.noteEncode(itemId);
        } catch (error) {
            console.log('Error encoding note ID: ', error);
        }
        $ndk.fetchEvent({ ids: [itemId] })
            .then(async (event) => {
                note = event;
            })
            .catch((e) => {
                console.error(e);
            });
    }

    if (item[0] === 'p') {
        itemType = 'Person';
        person = UserInterface.get({ hexpubkey: itemId });
    }

    function encodedId(hexId: string): string {
        let encoded: string = '';
        if (item[0] === 'e') {
            try {
                encoded = nip19.noteEncode(itemId);
            } catch (error) {
                console.log('Error encoding note ID: ', error);
            }
        } else {
            try {
                encoded = nip19.npubEncode(itemId);
            } catch (error) {
                console.log('Error encoding npub: ', error);
            }
        }
        return encoded;
    }

    function submitRemove() {
        dispatch('removeItemFromList', { addr: encodedId(itemId), action: 'delete' });
    }
</script>

<div
    class="flex flex-row items-center justify-between
    py-2 px-3 rounded-md border
    {saved ? 'border-solid border-stone-800/20 dark:border-stone-100/20' : 'border-dashed'}
    {action === 'added' ? 'border-green-500 dark:border-green-300/50' : ''}
    {action === 'deleted' ? 'border-orange-500 dark:border-orange-300/50' : ''}"
>
    {#if itemType === 'Person'}
        {#if $person}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={$person.image} class="object-cover" />
                <span class="">{$person.displayName || $person.name}</span>
            </div>
            <div class="flex flex-col md:flex-row gap-4 items-center">
                {#if !saved}
                    <span
                        class="text-sm
                    {action === 'added' ? 'text-green-500 dark:text-green-300/50' : ''}
                    {action === 'deleted' ? 'text-orange-500 dark:text-orange-300/50' : ''}"
                        >Unpublished {action === 'added' ? 'addition' : 'deletion'}</span
                    >
                {/if}
                <InfoIcon />
                <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                    {nip19.npubEncode(itemId)}
                </Tooltip>
                <SharePopover type={itemType} id={itemId} />
                <a
                    href="https://primal.net/profile/{nip19.npubEncode(itemId)}"
                    class="hover:text-stone-700 hover:dark:text-stone-400"
                    target="_blank"
                >
                    <LinkOutIcon />
                </a>
                {#if $currentUser?.hexpubkey === list.authorHexPubkey && saved && $page.url.pathname.startsWith('/a/')}
                    <button on:click={submitRemove}>
                        <XMarkIcon />
                        <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                            Remove this item from the list
                        </Tooltip>
                    </button>
                {/if}
            </div>
        {/if}
    {:else}
        <div class="w-4/5 break-words text-sm md:text-base">
            {note?.content || itemId}
        </div>
        <div class="flex flex-col md:flex-row gap-4 items-center">
            <SharePopover type={itemType} id={itemId} />
            {#if encodedNoteId}
                <a
                    href="https://primal.net/thread/{nip19.noteEncode(itemId)}"
                    class="hover:text-stone-700 hover:dark:text-stone-400"
                    target="_blank"
                >
                    <LinkOutIcon />
                </a>
            {/if}
            {#if $currentUser?.hexpubkey === list.authorHexPubkey && saved && $page.url.pathname.startsWith('/a/')}
                <button on:click={submitRemove}>
                    <XMarkIcon />
                    <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                        Remove this item from the list
                    </Tooltip>
                </button>
            {/if}
        </div>
    {/if}
</div>
