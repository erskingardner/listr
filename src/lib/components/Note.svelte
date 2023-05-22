<script lang="ts">
    import type { NDKEvent } from '@nostr-dev-kit/ndk';
    import { Avatar } from 'flowbite-svelte';
    import ndk from '$lib/stores/ndk';
    import SharePopover from '$lib/components/SharePopover.svelte';
    import { truncatedNpub, truncatedNip05 } from '$lib/interfaces/users';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import LinkOutIcon from '$lib/elements/icons/LinkOut.svelte';
    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    dayjs.extend(relativeTime);

    export let note: NDKEvent;

    const createdTime = note.created_at ? new Date(note.created_at * 1000) : Date.now();
    const createdTimeAgo = dayjs(createdTime).fromNow();

    const user = $ndk.getUser({ hexpubkey: note.pubkey });
</script>

<div
    class="noteListWrapper border border-stone-800/20 dark:border-stone-100/20 p-4 mb-2 rounded-md"
>
    <div class="flex flex-row justify-between gap-6 md:gap-16">
        <div class="flex flex-col gap-4">
            {#await user.fetchProfile()}
                <Avatar src={undefined} class="animate-pulse" />
            {:then value}
                <div class="flex flex-row gap-4 items-center">
                    <Avatar src={user.profile?.image} />
                    <div class="flex flex-col gap-0">
                        <div class="flex flex-col md:flex-row gap-2 item-center">
                            <h2 class="text-lg font-semibold">
                                {user.profile?.displayName ||
                                    user.profile?.name ||
                                    truncatedNpub(user)}
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
            <div class="break-all md:break-words text-sm md:text-base">{note.content}</div>
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
        </div>
    </div>
</div>
