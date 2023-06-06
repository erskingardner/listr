<script lang="ts">
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { page } from '$app/stores';
    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    dayjs.extend(relativeTime);
    import { createEventDispatcher } from 'svelte';
    import NoteContent from '../NoteContent.svelte';
    import type List from '$lib/classes/list';
    import User from '$lib/classes/user';
    import type Note from '$lib/classes/note';
    import { nip19 } from 'nostr-tools';

    const dispatch = createEventDispatcher();

    export let list: List;
    export let note: Note;
    export let saved: boolean;
    export let isFeed: boolean;

    const createdTime = note.createdAt ? new Date(note.createdAt * 1000) : Date.now();
    const createdTimeAgo = dayjs(createdTime).fromNow();

    const user = User.get(note.authorPubkey);

    function submitRemove() {
        dispatch('removeItemFromList', { addr: note.nip19, action: 'delete' });
    }

    // This is a gross hack to get back a real User object, not a duck-typed pseudo-user.
    let realUser: User;
    $: if ($user && !realUser) realUser = new User($user);
</script>

<div class="flex flex-row justify-between gap-6 md:gap-16 w-full">
    <div class="flex flex-col gap-4">
        {#if realUser}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={realUser.image} />
                <div class="flex flex-col gap-0">
                    <div class="flex flex-col md:flex-row gap-2 item-center">
                        <h2 class="text-lg font-semibold">
                            {realUser.displayableName()}
                        </h2>
                        {#if realUser.nip05}
                            <div class="flex flex-row items-center gap-1 text-xs md:text-sm">
                                <VerifiedCheckIcon />
                                {realUser.truncatedNip05()}
                            </div>
                        {/if}
                    </div>
                    <div class="text-xs md:text-sm">
                        <a href="https://primal.net/thread/{note.nip19}" target="_blank">
                            {createdTimeAgo}
                        </a>
                    </div>
                </div>
            </div>
        {:else}
            <Avatar src={undefined} class="animate-pulse" />
        {/if}
        <div class="break-all md:break-words text-sm md:text-base">
            <NoteContent note={note.content} tags={note.tags} />
        </div>
    </div>
    <div class="flex flex-col md:flex-row gap-4 items-center noteIconsWrapper opacity-20">
        <SharePopover type="Event" id={note.id} />
        <a
            href="https://primal.net/thread/{note.nip19}"
            class="hover:text-stone-700 hover:dark:text-stone-400 border-0"
            target="_blank"
        >
            <LinkOutIcon />
        </a>
        {#if $currentUser?.pubkey === list.authorPubkey && saved && !isFeed && $page.url.pathname.startsWith('/a/')}
            <button on:click={submitRemove}>
                <XMarkIcon />
                <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                    Remove this item from the list
                </Tooltip>
            </button>
        {/if}
    </div>
</div>
