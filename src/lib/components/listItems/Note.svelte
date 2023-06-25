<script lang="ts">
    import { Tooltip } from 'flowbite-svelte';
    import { currentUser } from '$lib/stores/currentUser';
    import ItemOptionsPopover from '$lib/components/ItemsOptionsPopover.svelte';
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
    import { Avatar, Name } from '@nostr-dev-kit/ndk-svelte-components';
    import ndk from '$lib/stores/ndk';
    import ItemsOptionsPopover from '$lib/components/ItemsOptionsPopover.svelte';

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
                <Avatar
                    ndk={$ndk}
                    pubkey={note.authorPubkey}
                    class="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-800"
                />
                <div class="flex flex-col gap-0">
                    <div class="flex flex-col md:flex-row gap-2 item-center">
                        <h2 class="text-lg font-semibold">
                            <Name ndk={$ndk} pubkey={note.authorPubkey} />
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
        {/if}
        <div class="break-all md:break-words text-sm md:text-base">
            <NoteContent note={note.content} tags={note.tags} />
        </div>
    </div>
    <div class="flex flex-col md:flex-row gap-4 items-center noteIconsWrapper md:opacity-20">
        <ItemsOptionsPopover type="Event" id={note.id} />
        {#if $currentUser?.pubkey === list.authorPubkey && saved && !isFeed && $page.url.pathname.startsWith('/a/')}
            <button on:click={submitRemove}>
                <XMarkIcon />
                <Tooltip
                    style="custom"
                    class="dark:bg-zinc-800 bg-zinc-100  border border-black/20 shadow-xl"
                >
                    Remove this item from the list
                </Tooltip>
            </button>
        {/if}
    </div>
</div>
