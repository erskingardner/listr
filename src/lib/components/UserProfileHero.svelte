<script lang="ts">
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import UserInterface from '$lib/interfaces/users';
    import { Avatar } from 'flowbite-svelte';
    import type { Observable } from 'dexie';
    import { onMount } from 'svelte';

    export let userHexId: string;

    let user: Observable<App.User>;

    let bannerImage: string | undefined = undefined;
    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';

    onMount(async () => {
        user = await UserInterface.get({ hexpubkey: userHexId });
    });

    $: bannerImage = $user?.banner || defaultBannerImage;
</script>

<div class="profileWrapper relative w-full mb-14">
    <div
        class="absolute inset-0 w-full h-full bg-center bg-cover z-0 rounded-lg"
        style={`background-image: url(${bannerImage})`}
    />
    <div
        class="absolute py-6 inset-0 w-full h-full bg-gradient-to-b from-transparent to-stone-50 dark:to-stone-950 z-1"
    />
    {#if $user}
        <div class="relative profileMetadata flex flex-col gap-4 pt-10 ml-10 max-w-lg">
            <Avatar src={$user.image} class="w-40 h-40 border-stone-100" border />
            <!-- <Avatar userProfile={_userProfile} klass="w-40 h-40" /> -->
            <h1 class="text-3xl font-bold">{$user.displayName || $user.name}</h1>
            {#if $user.nip05}
                <p class="flex flex-row gap-1 text-xl font-medium">
                    {$user.nip05}
                    <VerifiedCheckIcon />
                </p>
            {/if}

            <p class="text-xl font-medium">{$user.about}</p>
        </div>
    {/if}
</div>
