<script lang="ts">
    import type { NDKEvent, NDKUserProfile } from '@nostr-dev-kit/ndk';
    import { Avatar } from 'flowbite-svelte';
    import ndk from '$lib/stores/ndk';
    import dayjs from 'dayjs';
    import relativeTime from 'dayjs/plugin/relativeTime';
    dayjs.extend(relativeTime);

    export let note: NDKEvent;

    const createdTime = note.created_at ? new Date(note.created_at * 1000) : Date.now();
    const createdTimeAgo = dayjs(createdTime).fromNow();

    const user = $ndk.getUser({ hexpubkey: note.pubkey });
</script>

<div class="border border-stone-800/20 dark:border-stone-100/20 p-2 mb-2 rounded-md">
    {#await user.fetchProfile()}
        <Avatar src={undefined} class="animate-pulse" />
    {:then value}
        <Avatar src={user.profile?.image} />
    {/await}
    <div>{note.content}</div>
    <div>{createdTimeAgo}</div>
</div>
