<script lang="ts">
    import ndk from '$lib/stores/ndk';
    import type { NDKUserProfile } from '@nostr-dev-kit/ndk';

    export let npub: string | undefined = undefined;
    export let profile: NDKUserProfile | undefined = undefined;
    export let klass: string = '';

    let userProfile: NDKUserProfile | undefined;
    if (!!profile) {
        userProfile = profile;
    } else if (!profile && !!npub) {
        const user = $ndk.getUser({ npub: npub });
        user.fetchProfile().then(async () => {
            userProfile = user.profile;
        });
    }

    $: userProfile;
</script>

{#if !!userProfile}
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
