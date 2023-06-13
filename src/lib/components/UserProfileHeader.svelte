<script lang="ts">
    import { Avatar } from 'flowbite-svelte';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import type User from '$lib/classes/user';

    export let user: User;

    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';
</script>

<div class="profileWrapper relative w-full mb-14">
    {#if user}
        <div
            class="absolute inset-0 w-full min-h-[286px] h-full bg-center bg-cover z-0 rounded-lg"
            style={`background-image: url(${user.banner || defaultBannerImage})`}
        />
        <div
            class="z-1 absolute py-6 inset-0 w-full min-h-[286px] h-full
    bg-gradient-to-b from-transparent to-zinc-50 dark:to-zinc-950"
        />
        <div class="relative profileMetadata flex flex-col gap-4 pt-10 ml-10 max-w-lg">
            <Avatar src={user.image} class="w-40 h-40 border-zinc-100 object-cover" border />
            <h1 class="text-3xl font-bold">
                {user.displayableName()}
            </h1>
            {#if user.nip05}
                <p class="flex flex-row gap-1 text-xl font-medium items-center">
                    {user.truncatedNip05()}
                    <VerifiedCheckIcon klass="w-5 h-5" />
                </p>
            {/if}

            <p class="text-xl font-medium break-words">{user.about}</p>
        </div>
    {/if}
</div>
