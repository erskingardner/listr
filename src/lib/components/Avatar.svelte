<script lang="ts">
    import ndk from '$lib/stores/ndk';
    import type { NDKUserProfile } from '@nostr-dev-kit/ndk';
    import UserInterface from '$lib/interfaces/users';

    export let userProfile: NDKUserProfile | undefined;
    export let klass: string = '';
    const defaultImageSeed = userProfile?.displayName
        ? userProfile?.displayName.slice(0, 2)
        : 'asldfkja';

    let defaultImage = `https://robohash.org/${defaultImageSeed}`;
</script>

{#if userProfile}
    <div class="avatar">
        <img
            src={userProfile?.image || defaultImage}
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
