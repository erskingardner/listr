<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { fly } from "svelte/transition";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";
import AddToListButton from "../lists/actions/AddToListButton.svelte";
import FollowButton from "../lists/actions/FollowButton.svelte";
import UserDetails from "./UserDetails.svelte";

let { user, userProfile }: { user: NDKUser; userProfile?: NDKUserProfile } = $props();

// Cast ndk to NDKSvelte for component compatibility
const ndkSvelte = ndk as unknown as NDKSvelte;
</script>

<User.Root ndk={ndkSvelte} pubkey={user.pubkey} profile={userProfile}>
    <div
        class="flex flex-col gap-2 not-prose text-black dark:text-gray-50 border border-gray-300 dark:border-gray-700 shadow-3xl dark:shadow-dark3xl p-4 bg-white dark:bg-gray-800 rounded-lg w-96 z-50 relative"
        in:fly={{ duration: 300, y: 10 }}
        out:fly={{ duration: 100, y: 10 }}
    >
        <div class="flex flex-row justify-between items-start">
            <UserDetails
                {user}
                userProfile={userProfile}
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
        <User.Bio class="text-sm not-prose leading-relaxed whitespace-normal wrap-break-word" />
    </div>
</User.Root>
