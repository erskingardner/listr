<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import CopyId from "../lists/actions/CopyId.svelte";
import UserAvatar from "./UserAvatar.svelte";
import UserCard from "./UserCard.svelte";
import UserName from "./UserName.svelte";
import UserNip05 from "./UserNip05.svelte";

let {
    user,
    userProfile,
    noPopover = false,
    npubCopy = false,
    avatarSize = "12",
}: {
    user: NDKUser;
    userProfile?: NDKUserProfile;
    noPopover?: boolean;
    npubCopy?: boolean;
    avatarSize?: string;
} = $props();

let userCardVisible = $state(false);
</script>

<div
    role="link"
    tabindex="-1"
    class="flex flex-row gap-2 items-center relative"
    onmouseleave={() => (userCardVisible = false)}
>
    <a href="/{user.npub}" onmouseenter={() => (userCardVisible = true)}>
        <UserAvatar
            {user}
            {userProfile}
            extraClasses="w-{avatarSize} h-{avatarSize} dark:bg-gray-700! rounded-full overflow-hidden object-cover"
        />
    </a>
    {#if userCardVisible && !noPopover}
        <div
            class="absolute -translate-y-[59%] z-50 left-10 -translate-x-1/2 p-2 pb-6 bg-transparent"
        >
            <UserCard {user} />
        </div>
    {/if}
    <div class="flex flex-col gap-0.5 truncate">
        <a href="/{user.npub}" class="font-medium hover:underline truncate">
            <UserName
                {user}
                {userProfile}
                npubMaxLength={9}
            />
        </a>
        <UserNip05
            {user}
            {userProfile}
            nip05MaxLength={28}
            extraClasses="flex flex-row gap-1 items-center text-sm truncate"
        />
        {#if npubCopy}
            <span class="text-xs flex flex-row gap-1 mt-2 items-center">
                {user.npub.slice(0, 18)}...
                <div class="shrink">
                    <CopyId nip19={user.npub} size="16" showText={false} />
                </div>
            </span>
        {/if}
    </div>
</div>
