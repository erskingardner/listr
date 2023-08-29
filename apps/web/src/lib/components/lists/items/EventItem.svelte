<script lang="ts">
    import {
        Avatar,
        Name,
        EventContent,
        prettifyNip05,
    } from "@nostr-dev-kit/ndk-svelte-components";
    import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import { timeAgo } from "$lib/utils";
    import { BadgeCheck } from "lucide-svelte";
    import PrivateItemPill from "./PrivateItemPill.svelte";

    export let id: string;
    export let privateItem: boolean;

    let event: NDKEvent | null;
    let user: NDKUser | null;

    async function fetchEventAndUser() {
        event = await $ndk.fetchEvent(id);
        user = $ndk.getUser({ hexpubkey: event?.pubkey });
    }

    fetchEventAndUser();
</script>

{#key id}
    {#if event && user}
        <div class="flex flex-col gap-6 border border-gray-200 rounded-md p-2 my-2">
            <div class="flex flex-row gap-2 items-center">
                <a href="/{user?.npub}" class="flex flex-row gap-2 items-center">
                    <Avatar ndk={$ndk} pubkey={event.pubkey} class="w-12 h-12 rounded-full block" />
                    <div class="flex flex-col gap-1">
                        <Name
                            ndk={$ndk}
                            pubkey={event.pubkey}
                            npubMaxLength={9}
                            class="font-medium"
                        />
                        {#await user.fetchProfile() then value}
                            {#if user.profile?.nip05}
                                <span
                                    class="flex flex-row gap-1 items-center text-xs whitespace-nowrap min-w-0 overflow-hidden text-ellipsis"
                                >
                                    <BadgeCheck
                                        size="16"
                                        strokeWidth="1.5"
                                        class="fill-purple-200 stroke-purple-800"
                                    />
                                    {prettifyNip05(user.profile?.nip05)}
                                </span>
                            {/if}
                        {/await}
                    </div>
                </a>
                {#if privateItem}
                    <PrivateItemPill />
                {/if}
                <div class="ml-auto text-sm">{timeAgo(event.created_at)}</div>
            </div>
            <div class="break-words">
                <EventContent ndk={$ndk} {event} />
            </div>
        </div>
    {/if}
{/key}
