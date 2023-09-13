<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import type { NDKList, NDKUser } from "@nostr-dev-kit/ndk";
    import UserListNav from "$lib/components/lists/UserListNav.svelte";
    import { afterUpdate, onMount } from "svelte";
    import currentUser from "$lib/stores/currentUser";
    import { afterNavigate } from "$app/navigation";
    import UserDetails from "$lib/components/users/UserDetails.svelte";
    import UserBio from "$lib/components/users/UserBio.svelte";
    import FollowButton from "$lib/components/lists/actions/FollowButton.svelte";
    import AddToListButton from "$lib/components/lists/actions/AddToListButton.svelte";

    export let data;

    let user: NDKUser = $ndk.getUser({ hexpubkey: data.pubkey });

    onMount(() => {
        user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterUpdate(() => {
        if (user.hexpubkey !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterNavigate(() => {
        if (user.hexpubkey !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    let list: NDKList;
</script>

<div class="flex flex-row gap-6">
    {#if $currentUser?.npub === user.npub}
        <!-- Don't render inside user list nav if it's a current user's list -->
    {:else}
        <!-- User profile and list of lists -->
        <div
            class="text-sm flex flex-col gap-2 border border-gray-300 rounded-md shadow-md p-4 w-[18rem] shrink-0"
        >
            {#key data.pubkey}
                <div class="flex flex-col gap-2">
                    <UserDetails {user} npubCopy={true} avatarSize="16" />
                    <hr />
                    <div class="flex flex-row gap-2 justify-between items-stretch">
                        <FollowButton {user} />
                        <AddToListButton {user} />
                    </div>
                    <hr />
                    <UserBio {user} />
                </div>
                <hr />
                <UserListNav userPubkey={data.pubkey} />
            {/key}
        </div>
    {/if}

    <!-- List contents -->
    <div class="flex flex-col gap-2 border border-gray-300 rounded-md shadow-md p-4 grow">
        <slot />
    </div>
</div>

<style lang="postcss">
    * > :global(.userCard--avatar) {
        @apply w-10 h-10;
    }

    * > :global(.userCard--details) {
        @apply w-full;
    }
</style>
