<script lang="ts">
    import ndk from "$lib/stores/ndk";
    import type { NDKList, NDKUser } from "@nostr-dev-kit/ndk";
    import UserListNav from "$lib/components/lists/UserListNav.svelte";
    import { Avatar, Name, prettifyNip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import { afterUpdate, onMount } from "svelte";
    import currentUser from "$lib/stores/currentUser";
    import { afterNavigate } from "$app/navigation";
    import Nip05 from "$lib/components/users/Nip05.svelte";

    export let data;

    let user: NDKUser = $ndk.getUser({ hexpubkey: data.pubkey });

    onMount(() => {
        user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterUpdate(() => {
        if (user.hexpubkey() !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
    });

    afterNavigate(() => {
        if (user.hexpubkey() !== data.pubkey) user = $ndk.getUser({ hexpubkey: data.pubkey });
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
                {#await user.fetchProfile()}
                    <span class="animate-pulse">Loading user...</span>
                {:then value}
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row gap-2 items-start">
                            <div
                                class="w-12 h-12 rounded-full border border-gray-300 shadow-sm overflow-hidden shrink-0"
                            >
                                <Avatar ndk={$ndk} pubkey={data.pubkey} />
                            </div>
                            <div class="flex flex-col gap-1 shrink min-w-0">
                                <Name
                                    ndk={$ndk}
                                    pubkey={data.pubkey}
                                    npubMaxLength={9}
                                    class="font-bold"
                                />
                                {#if user.profile?.nip05}
                                    <Nip05 pubkey={user.hexpubkey()} nip05={user.profile.nip05} />
                                {/if}
                            </div>
                        </div>
                        <hr />
                        {#if user.profile?.bio || user.profile?.about}
                            <p class="break-words">{user.profile?.bio || user.profile?.about}</p>
                        {/if}
                    </div>
                {:catch error}
                    <span class="text-red-500">Error loading user</span>
                {/await}
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
