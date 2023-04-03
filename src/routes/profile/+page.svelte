<script lang="ts">
    import { currentUserProfile } from '$lib/stores/currentUser';
    import Avatar from '$lib/components/Avatar.svelte';

    let bannerImage: string | undefined = undefined;
    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';

    $: {
        bannerImage = $currentUserProfile?.banner || defaultBannerImage;
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
        {#if $currentUserProfile}
            <Avatar profileMetadata={$currentUserProfile} klass="w-40 h-40" />
        {/if}
    </div>
</div>
{#if $currentUserProfile}
    <div class="profileMetadata flex flex-col gap-4 mt-16 ml-10 max-w-lg">
        <h1 class="text-3xl font-bold">{$currentUserProfile?.displayName}</h1>
        <p class="text-xl font-medium">{$currentUserProfile?.nip05}</p>
        <p class="text-xl font-medium">{$currentUserProfile?.about}</p>
        <p class="text-xl font-medium">
            <!-- <a href={$currentUserProfile?.website}>{$currentUserProfile?.website}</a> -->
        </p>
    </div>
{/if}
