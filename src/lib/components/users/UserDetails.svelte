<script lang="ts">
import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
import type { NDKSvelte } from "@nostr-dev-kit/svelte";
import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";
import { User } from "$lib/ndk/ui/user";
import ndk from "$lib/stores/ndk.svelte";

// Cast ndk to NDKSvelte for component compatibility
const ndkSvelte = ndk as unknown as NDKSvelte;

import CopyId from "../lists/actions/CopyId.svelte";
import UserCard from "./UserCard.svelte";

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

// Map avatarSize to Tailwind classes
const avatarSizeClass = $derived(`w-${avatarSize} h-${avatarSize}`);
</script>

{#snippet verificationSnippet({ status, isVerifying }: { status: boolean | null | undefined; isVerifying: boolean })}
    {#if isVerifying || status === undefined}
        <BadgeHelp
            size="16"
            strokeWidth="1.5"
            class="fill-gray-200 stroke-gray-600 w-4 h-4"
        />
    {:else if status === true}
        <BadgeCheck
            size="16"
            strokeWidth="1.5"
            class="fill-purple-200 stroke-purple-800"
        />
    {:else}
        <BadgeX
            size="16"
            strokeWidth="1.5"
            class="fill-red-200 stroke-red-800 w-4 h-4"
        />
    {/if}
{/snippet}

<User.Root ndk={ndkSvelte} pubkey={user.pubkey} profile={userProfile}>
    <div
        role="link"
        tabindex="-1"
        class="flex flex-row gap-2 items-center relative"
        onmouseleave={() => (userCardVisible = false)}
    >
        <a href="/{user.npub}" onmouseenter={() => (userCardVisible = true)}>
            <User.Avatar class="{avatarSizeClass} dark:bg-gray-700 rounded-full overflow-hidden object-cover" />
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
                <User.Name />
            </a>
            <User.Nip05
                class="flex flex-row gap-1 items-center text-sm truncate"
                showVerified={true}
                {verificationSnippet}
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
</User.Root>
