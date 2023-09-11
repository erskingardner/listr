<script lang="ts">
    import { Avatar, Name, Nip05 } from "@nostr-dev-kit/ndk-svelte-components";
    import ndk from "$lib/stores/ndk";
    import type { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";
    import { BadgeCheck, BadgeHelp, BadgeX } from "lucide-svelte";
    import { Popover } from "flowbite-svelte";
    import UserCard from "./UserCard.svelte";

    export let user: NDKUser;
    export let userProfile: NDKUserProfile | undefined = undefined;
    export let noPopover: boolean = false;
</script>

<div class="flex flex-row gap-2 items-center {user.npub}">
    <Avatar ndk={$ndk} {user} {userProfile} class="w-12 h-12 rounded-full" />
    <div class="flex flex-col gap-0.5 truncate">
        <Name
            ndk={$ndk}
            {user}
            {userProfile}
            npubMaxLength={9}
            class="font-medium hover:underline"
        />
        <Nip05
            ndk={$ndk}
            {userProfile}
            pubkey={user.hexpubkey}
            class="flex flex-row gap-1 items-center text-sm"
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
    </div>
</div>

{#if !noPopover}
    <Popover triggeredBy=".{user.npub}" class="z-50">
        <UserCard {user} />
    </Popover>
{/if}
