<script lang="ts">
    import ndk from '$lib/stores/ndk';
    import type { NDKUserProfile, NDKUser } from '@nostr-dev-kit/ndk';

    export let pubKey: string | undefined = undefined;
    export let profileMetadata: NDKUserProfile | undefined = undefined;
    export let klass: string = '';

    // If we don't have the data we need, throw.
    if (!profileMetadata && !pubKey) {
        throw new Error('Either pubKey or profileMetadata parameter are required.');
    }

    let user: NDKUser;
    let userProfile: NDKUserProfile | undefined;
    // If we don't have profileMetadata but we do have a pubkey
    if (!profileMetadata && !!pubKey) {
        user = $ndk.getUser({ npub: pubKey });
        user.fetchProfile();
    }

    $: userProfile = profileMetadata || user.profile;
</script>

{#if userProfile}
    <div class="avatar">
        <img
            src={userProfile.image}
            alt="Avatar for {userProfile.displayName}"
            class="
                w-12 h-12 rounded-full border-4
                border-stone-200 hover:border-stone-300
                dark:border-stone-800 hover:dark:border-stone-700
                {klass}
            "
        />
    </div>
{/if}
