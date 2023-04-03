<script lang="ts">
    import Avatar from '$lib/components/Avatar.svelte';
    import { currentUser, currentUserProfile } from '$lib/stores/currentUser';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';

    let bannerImage: string | undefined = undefined;
    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';

    $: {
        bannerImage = $currentUser?.profile?.banner || defaultBannerImage;
    }
</script>

<div class="profileWrapper relative w-full h-64">
    <div
        class="absolute inset-0 w-full h-full bg-center bg-cover z-0 rounded-lg"
        style={`background-image: url(${bannerImage})`}
    />
    <div
        class="absolute py-6 inset-0 w-full h-full bg-gradient-to-b from-transparent to-stone-950 z-1"
    />
    <div class="absolute -bottom-10 left-6 z-20">
        {#if $currentUser}
            <Avatar profile={$currentUserProfile} klass="w-40 h-40" />
        {/if}
    </div>
</div>
{#if $currentUser}
    <div class="profileMetadata flex flex-col gap-4 mt-16 ml-10 max-w-lg">
        <h1 class="text-3xl font-bold">{$currentUser?.profile?.displayName}</h1>
        {#if $currentUser.profile?.nip05}
            <p class="flex flex-row gap-1 text-xl font-medium">
                {$currentUser?.profile?.nip05}
                <VerifiedCheckIcon />
            </p>
        {/if}

        <p class="text-xl font-medium">{$currentUser?.profile?.about}</p>
        <p class="text-xl font-medium">
            <!-- <a href={$currentUserProfile?.website}>{$currentUserProfile?.website}</a> -->
        </p>
    </div>
{/if}
