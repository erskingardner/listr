<script lang="ts">
    import UserProfileHeader from "$lib/components/users/UserProfileHeader.svelte";
    import { page } from "$app/stores";
    import { getUserAndProfile } from "$lib/utils/nostr";
    import { onMount } from "svelte";
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

    let user: NDKUser;
    let profile: NDKUserProfile | null;

    $: {
        let userId = $page.params.userId;
        if (userId && user?.npub !== userId) {
            getUserAndProfile(userId).then(({ user: tmpUser, profile: tmpProfile }) => {
                user = tmpUser;
                profile = tmpProfile;
            });
        }
    }
</script>

{#if user}
    {#key user.pubkey}
        <UserProfileHeader pubkey={user.pubkey} />
    {/key}
{/if}

<slot />

<style lang="postcss">
    * > :global(.userCard--avatar) {
        @apply w-10 h-10;
    }

    * > :global(.userCard--details) {
        @apply w-full;
    }
</style>
