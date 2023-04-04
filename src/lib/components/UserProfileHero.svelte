<script lang="ts">
    import Avatar from '$lib/components/Avatar.svelte';
    import VerifiedCheckIcon from '$lib/elements/icons/VerifiedCheck.svelte';
    import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
    import UserInterface from '$lib/interfaces/users';

    export let userProfile: NDKUserProfile | undefined = undefined;
    export let userHexId: string | undefined = undefined;

    // Throw error if we're missing both params
    if (!userProfile && !userHexId) {
        throw new Error('Missing required params');
    }

    let _userProfile: NDKUserProfile;
    let observeUserProfile;

    if (userProfile) {
        _userProfile = userProfile;
    }

    let bannerImage: string | undefined = undefined;
    const defaultBannerImage =
        'https://nostr.build/i/nostr.build_e76387d298587c61e40913929eafe746ce6a780938750d21913a7b488228a146.webp';

    $: {
        if (!_userProfile && userHexId) {
            console.log('BAL');
            observeUserProfile = UserInterface.get({ hexpubkey: userHexId });
            _userProfile = $observeUserProfile! as NDKUserProfile;
        }
        bannerImage = _userProfile?.banner || defaultBannerImage;
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
</div>
<div class="absolute top-36 profileMetadata flex flex-col gap-4 mt-16 ml-10 max-w-lg">
    <Avatar userProfile={_userProfile} klass="w-40 h-40" />
    <h1 class="text-3xl font-bold">{_userProfile?.displayName}</h1>
    {#if _userProfile?.nip05}
        <p class="flex flex-row gap-1 text-xl font-medium">
            {_userProfile?.nip05}
            <VerifiedCheckIcon />
        </p>
    {/if}

    <p class="text-xl font-medium">{_userProfile?.about}</p>
</div>
