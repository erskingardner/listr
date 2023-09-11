<script lang="ts">
    import { EventContent } from "@nostr-dev-kit/ndk-svelte-components";
    import type { NDKEvent, NDKUser } from "@nostr-dev-kit/ndk";
    import ndk from "$lib/stores/ndk";
    import { timeAgo } from "$lib/utils";
    import PrivateItemPill from "./PrivateItemPill.svelte";
    import ItemActions from "./ItemActions.svelte";
    import RemovalItemPill from "./RemovalItemPill.svelte";
    import UserDetails from "$lib/components/users/UserDetails.svelte";

    export let type: string;
    export let id: string;
    export let privateItem: boolean;
    export let unsaved: boolean;
    export let removal: boolean;

    let event: NDKEvent | null;
    let user: NDKUser | null;

    let createdTime: number;

    async function fetchEventAndUser() {
        event = await $ndk.fetchEvent(id);
        user = $ndk.getUser({ hexpubkey: event?.pubkey });
        createdTime = event?.created_at as number;
    }

    fetchEventAndUser();
</script>

{#key id}
    {#if event && user}
        <div
            class="flex flex-col gap-6 border border-gray-200 rounded-md p-2 my-2 {unsaved
                ? 'border-orange-500 border-dashed'
                : ''}"
        >
            <div class="flex flex-row gap-2 items-center">
                <a href="/{user?.npub}" class="flex flex-row gap-2 items-center">
                    <UserDetails {user} />
                </a>
                {#if privateItem}
                    <PrivateItemPill />
                {/if}
                <div class="flex flex-row gap-2 items-center ml-auto text-sm">
                    {#if removal}
                        <RemovalItemPill />
                    {/if}
                    <div title={`${new Date(createdTime)}`}>{timeAgo(createdTime)}</div>
                    <ItemActions {type} {id} {privateItem} {unsaved} {removal} on:removeItem />
                </div>
            </div>
            <div class="break-words">
                <EventContent ndk={$ndk} {event} />
            </div>
        </div>
    {/if}
{/key}
