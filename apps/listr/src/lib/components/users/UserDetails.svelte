<script lang="ts">
    import { Avatar, Name, Nip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";
    import UserCard from "./UserCard.svelte";
    import CopyId from "../lists/actions/CopyId.svelte";

    export let user: NDKUser;
    export let userProfile: NDKUserProfile | undefined = undefined;
    export let noPopover: boolean = false;
    export let npubCopy: boolean = false;
    export let avatarSize: string = "12";

    let userCardVisible: boolean = false;
</script>

<div
    role="link"
    tabindex="-1"
    class="flex flex-row gap-2 items-center relative"
    on:mouseleave={() => (userCardVisible = false)}
>
    <a href="/{user.npub}" on:mouseenter={() => (userCardVisible = true)}>
        <Avatar
            ndk={$ndk}
            {user}
            {userProfile}
            class="w-{avatarSize} h-{avatarSize} dark:!bg-gray-700 rounded-full overflow-hidden object-cover"
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
        <a href="/{user.npub}">
            <Name
                ndk={$ndk}
                {user}
                {userProfile}
                npubMaxLength={9}
                class="font-medium hover:underline"
            />
        </a>
        <Nip05
            ndk={$ndk}
            {userProfile}
            pubkey={user.pubkey}
            class="flex flex-row gap-1 items-center text-sm truncate"
            nip05MaxLength={28}
        >
            <span slot="badge" let:nip05Valid>
                {#if nip05Valid === undefined}
                    <BadgeHelp
                        size="16"
                        strokeWidth="1.5"
                        class="fill-gray-200 stroke-gray-600 w-4 h-4"
                    />
                {:else if nip05Valid}
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
            </span>
        </Nip05>
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
