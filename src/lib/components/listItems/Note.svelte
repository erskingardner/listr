<script lang="ts">
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { Avatar, Tooltip } from 'flowbite-svelte';
    import ndk from '$lib/stores/ndk';
    import { currentUser } from '$lib/stores/currentUser';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import { truncatedNpub, truncatedNip05 } from '$lib/interfaces/users';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import XMarkIcon from '$lib/elements/icons/XMark.svelte';
    import { page } from '$app/stores';
    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    dayjs.extend(relativeTime);
    import { createEventDispatcher } from 'svelte';
    import NoteContent from '../NoteContent.svelte';

    const dispatch = createEventDispatcher();

    export let list: App.List;
    export let note: NDKEvent;
    export let saved: boolean;
    export let isFeed: boolean;

    const createdTime = note.created_at ? new Date(note.created_at * 1000) : Date.now();
    const createdTimeAgo = dayjs(createdTime).fromNow();

    const user = $ndk.getUser({ hexpubkey: note.pubkey });

    function submitRemove() {
        dispatch('removeItemFromList', { addr: note.encode(), action: 'delete' });
    }
</script>

<div class="flex flex-row justify-between gap-6 md:gap-16 w-full">
    <div class="flex flex-col gap-4">
        {#await user.fetchProfile()}
            <Avatar src={undefined} class="animate-pulse" />
        {:then value}
            <div class="flex flex-row gap-4 items-center">
                <Avatar src={user.profile?.image} />
                <div class="flex flex-col gap-0">
                    <div class="flex flex-col md:flex-row gap-2 item-center">
                        <h2 class="text-lg font-semibold">
                            {user.profile?.displayName || user.profile?.name || truncatedNpub(user)}
                        </h2>
                        {#if user.profile?.nip05}
                            <div class="flex flex-row items-center gap-1 text-xs md:text-sm">
                                <VerifiedCheckIcon />
                                {truncatedNip05(user.profile)}
                            </div>
                        {/if}
                    </div>
                    <div class="text-xs md:text-sm">{createdTimeAgo}</div>
                </div>
            </div>
        {/await}
        <div class="break-all md:break-words text-sm md:text-base">
            <NoteContent note={note.content} tags={note.tags} />
        </div>
    </div>
    <div class="flex flex-col md:flex-row gap-4 items-center noteIconsWrapper opacity-20">
        <SharePopover type="Event" id={note.id} />
        <a
            href="https://primal.net/thread/{note.encode()}"
            class="hover:text-stone-700 hover:dark:text-stone-400 border-0"
            target="_blank"
        >
            <LinkOutIcon />
        </a>
        {#if $currentUser?.hexpubkey === list.authorHexPubkey && saved && !isFeed && $page.url.pathname.startsWith('/a/')}
            <button on:click={submitRemove}>
                <XMarkIcon />
                <Tooltip style="custom" class="dark:bg-stone-800 bg-stone-100 shadow-sm">
                    Remove this item from the list
                </Tooltip>
            </button>
        {/if}
    </div>
</div>
