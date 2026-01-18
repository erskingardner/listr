<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { fly } from "svelte/transition";
import AddToListButton from "../lists/actions/AddToListButton.svelte";
import FollowButton from "../lists/actions/FollowButton.svelte";
import UserBio from "./UserBio.svelte";
import UserDetails from "./UserDetails.svelte";

let { user, userProfile }: { user: NDKUser; userProfile?: NDKUserProfile } = $props();

let fetchedProfile: NDKUserProfile | null | undefined = $state(undefined);
let profile = $derived(userProfile || user.profile || fetchedProfile);

$effect(() => {
    if (!profile) {
        user.fetchProfile().then((p) => {
            fetchedProfile = p;
        });
    }
});
</script>

<div
    class="flex flex-col gap-2 not-prose text-black dark:text-gray-50 border border-gray-300 dark:border-gray-700 shadow-3xl dark:shadow-dark3xl p-4 bg-white dark:bg-gray-800 rounded-lg w-96 z-50 relative"
    in:fly={{ duration: 300, y: 10 }}
    out:fly={{ duration: 100, y: 10 }}
>
    {#await user.fetchProfile()}
        <p class="animate-pulse">Loading user...</p>
    {:then}
        <div class="flex flex-row justify-between items-start">
            <UserDetails
                {user}
                userProfile={user.profile}
                noPopover={true}
                npubCopy={true}
                avatarSize="16"
            />
        </div>
        <hr class="dark:border-gray-500" />
        <div class="flex flex-row gap-4 justify-between items-stretch">
            <FollowButton {user} />
            <AddToListButton {user} />
        </div>
        <hr class="dark:border-gray-500" />
        <UserBio {user} userProfile={user.profile} />
    {:catch}
        <p>Error loading user</p>
    {/await}
</div>
