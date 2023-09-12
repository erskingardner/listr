<script lang="ts">
    import UserDetails from "./UserDetails.svelte";
    import UserBio from "./UserBio.svelte";
    import FollowButton from "../lists/actions/FollowButton.svelte";
    import type { NDKUser } from "@nostr-dev-kit/ndk";

    export let user: NDKUser;
</script>

<div class="flex flex-col gap-2 p-2 border-gray-300 rounded-md w-96 z-50 relative">
    {#await user.fetchProfile()}
        <p class="animate-pulse">Loading user...</p>
    {:then value}
        <div class="flex flex-row justify-between items-start">
            <UserDetails
                {user}
                userProfile={user.profile}
                noPopover={true}
                npubCopy={true}
                avatarSize="16"
            />
            <FollowButton {user} />
        </div>
        <hr />
        <UserBio {user} userProfile={user.profile} />
    {:catch error}
        <p>Error loading user</p>
    {/await}
</div>
