<script lang="ts">
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import UserInterface from '$lib/interfaces/users';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import { nip19 } from 'nostr-tools';
    import type { Observable } from 'dexie';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import SharePopover from './SharePopover.svelte';
    import ndk from '$lib/stores/ndk';
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { onMount } from 'svelte';

    export let item: string[];
    export let saved: boolean;

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
</script>

<div
    class="flex flex-row items-center justify-between
    py-2 px-3 rounded-md border
    border-stone-800/20 dark:border-stone-100/20
    {saved ? 'border-solid' : 'border-dashed border-orange-500 dark:border-orange-300/50'}"
>
    {#if itemType === 'Person'}
        {#if $person}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={$person.image} />
                <span class="">{$person.displayName || $person.name}</span>
            </div>
            <div class="flex flex-col md:flex-row gap-4 items-center">
                {#if !saved}
                    <span class="text-sm text-orange-500 dark:text-orange-300/50">Unpublished</span>
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
        </div>
    {/if}
</div>
