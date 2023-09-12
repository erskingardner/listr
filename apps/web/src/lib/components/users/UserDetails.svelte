<script lang="ts">
    import { Avatar, Name, Nip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import { BadgeCheck, BadgeHelp, BadgeX, Copy } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import UserCard from "./UserCard.svelte";
    import CopyId from "../lists/actions/CopyId.svelte";

    export let user: NDKUser;
    export let userProfile: NDKUserProfile | undefined = undefined;
    export let noPopover: boolean = false;
    export let npubCopy: boolean = false;
    export let avatarSize: string = "12";
</script>

<div class="flex flex-row gap-2 items-center {user.npub}">
    <Avatar ndk={$ndk} {user} {userProfile} class="w-{avatarSize} h-{avatarSize} rounded-full" />
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
            pubkey={user.hexpubkey}
            class="flex flex-row gap-1 items-center text-sm truncate"
        >
            <span slot="badge" let:nip05Valid>
                {#if nip05Valid === undefined}
                    <BadgeHelp size="16" strokeWidth="1.5" class="fill-gray-200 stroke-gray-600" />
                {:else if nip05Valid}
                    <BadgeCheck
                        size="16"
                        strokeWidth="1.5"
                        class="fill-purple-200 stroke-purple-800"
                    />
                {:else}
                    <BadgeX size="16" strokeWidth="1.5" class="fill-red-200 stroke-red-800" />
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

{#if !noPopover}
    <Popover triggeredBy=".{user.npub}" class="z-50">
        <UserCard {user} />
    </Popover>
{/if}
