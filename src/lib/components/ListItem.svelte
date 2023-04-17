<script lang="ts">
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import Note from '$lib/components/Note.svelte';
    import UserInterface from '$lib/interfaces/users';
    import InfoIcon from '$lib/elements/icons/Info.svelte';
    import LinkIcon from '$lib/elements/icons/Link.svelte';
    import { nip19 } from 'nostr-tools';
    import type { Observable } from 'dexie';
    import { onMount } from 'svelte';

    export let item: string[];
    let itemType: string;
    let itemId: string = item[1];
    let encodedNoteId: string = '';
    let person: Observable<App.User>;

    onMount(async () => {
        if (item[0] === 'e') {
            itemType = 'Event';
            try {
                encodedNoteId = nip19.noteEncode(itemId);
            } catch (error) {
                console.log('Error encoding note ID: ', error);
            }
        }

        if (item[0] === 'p') {
            itemType = 'Person';
            person = await UserInterface.get({ hexpubkey: itemId });
        }
    });
</script>

<div
    class="flex flex-row items-center justify-between py-2 px-3 border border-stone-800/20 dark:border-stone-100/20 rounded-md"
>
    {#if itemType === 'Person'}
        {#if $person}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={$person.image} />
                <span class="">{$person.displayName || $person.name}</span>
            </div>
            <div class="flex flex-col md:flex-row gap-4 items-center">
                <InfoIcon />
                <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                    {nip19.npubEncode(itemId)}
                </Tooltip>
                <a
                    href="https://nostr.band/{nip19.npubEncode(itemId)}"
                    class="hover:text-stone-700 hover:dark:text-stone-400"
                    target="_blank"
                >
                    <LinkIcon />
                </a>
            </div>
        {/if}
    {:else}
        <Note noteId={itemId} klass="w-4/5" />
        <div class="flex flex-col md:flex-row gap-4 items-center">
            <InfoIcon />
            <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                Note ID: {itemId}
            </Tooltip>
            {#if encodedNoteId}
                <a
                    href="https://nostr.band/{nip19.noteEncode(itemId)}"
                    class="hover:text-stone-700 hover:dark:text-stone-400"
                    target="_blank"
                >
                    <LinkIcon />
                </a>
            {/if}
        </div>
    {/if}
</div>
